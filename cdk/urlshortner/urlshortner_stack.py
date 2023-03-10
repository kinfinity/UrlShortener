from constructs import Construct

from aws_cdk import (
    Stack,
    CfnTag,
    SecretValue,
    RemovalPolicy,
    aws_apigateway as apigateway,
    aws_lambda as _lambda,
    aws_dynamodb as dynamodb,
    aws_ec2 as ec2,
    aws_ecr as ecr,
    aws_iam as iam,
    aws_dynamodb as dynamodb,
    aws_dax as dax,
    aws_secretsmanager as sm,
    aws_route53 as route53,
    aws_apigatewayv2 as apigw,
    aws_certificatemanager as acm
)


class UrlShortnerStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create a VPC
        vpc = ec2.Vpc(
            self,
            "UrlShortnerVPC",
            cidr="10.0.0.0/16",
            availability_zones= ["us-east-2a", "us-east-2b", "us-east-2c"],
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name="private-subnet1",
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name="private-subnet2",
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name="private-subnet3",
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24
                )
            ]
        )

        # Create an IAM role for the DAX
        dax_role = iam.Role(
            self,
            "MyDaxRole",
            assumed_by=iam.ServicePrincipal("dax.amazonaws.com"),
            role_name="MyDaxRole",
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name(
                    "AmazonDynamoDBFullAccess"
                )
            ]
        )
        # Create the DAX cluster
        dax_cluster = dax.CfnCluster(
            self,
            "UrlShortnerDAXCluster",
            cluster_name="UrlShortnerCache",
            description="DAX Cluster",
            iam_role_arn=dax_role.role_arn, #
            node_type="dax.t3.small",
            replication_factor=1,
            # subnet_group_name=dax_subnet_group.subnet_group_name,
            # parameter_group_name=parameter_group.parameter_group_name,
            sse_specification=dax.CfnCluster.SSESpecificationProperty(
                sse_enabled=False
            ),
            tags={"Name": "UrlShortnerCache"}
        )

        # Create the DynamoDB table with DAX caching
        dynamodb_table = dynamodb.Table(
            self,
            "UrlShortnerTable",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            encryption=dynamodb.TableEncryption.AWS_MANAGED,
            point_in_time_recovery=True,
            stream=dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            table_name="URLsTable"
        )

        # get image uri
        ecr_repo = ecr.Repository.from_repository_name(
            self, 
            "UrlShortnerRepo",
            "url-shortner" # us-east-2 | docker tag url-shortner:latest 158661602367.dkr.ecr.us-east-1.amazonaws.com/url-shortner:latest
        )
        
        # Create an IAM role for the Lambda function
        lambda_role = iam.Role(
            self,
            "LambdaRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaVPCAccessExecutionRole"),
                iam.ManagedPolicy.from_aws_managed_policy_name('AmazonDynamoDBFullAccess')
            ]
        )
        # Attach the specified role
        lambda_role.add_to_policy(iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            resources=["*"],
            actions=["dax:*"]
        ))

        # Create an IAM policy that allows read and write access to the DynamoDB table
        dynamodb_policy = iam.PolicyStatement(
            actions=["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
            resources=[dynamodb_table.table_arn],
            effect=iam.Effect.ALLOW
        )
        lambda_role.attach_inline_policy(iam.Policy(self, "dynamoPolicy", statements=[dynamodb_policy]))

        # Create a Lambda function with VPC configuration
        lambda_function = _lambda.DockerImageFunction(
            self,
            "UrlShortnerProxyLambda",
            role= lambda_role.role_arn,
            code=_lambda.DockerImageCode.from_ecr(ecr_repo),# .repository_uri_for_tag("url-shortner:latest-dev")
            vpc=vpc,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PRIVATE_ISOLATED),
            allow_all_outbound=True,
        )

        api_gateway = apigateway.LambdaRestApi(
            self, 
            "ShortUrlAPIGW",
            rest_api_name= "shorturl-api",
            handler= lambda_function,
            proxy= True,
            cloud_watch_role= True,
            # domain_name= apigateway.DomainNameOptions(certificate=cert, domain_name="shorturls.com") # "shorturls.com"
        )

        # Store secrets
        secret_name = "dev/UrlShortner/DBSecrets"
        secret_value = {
            "DAX_ENDPOINT": SecretValue.unsafe_plain_text(dax_cluster.attr_cluster_discovery_endpoint_url)
        }

        db_secrets = sm.Secret(
            self,
            "DBSecrets",
            secret_name=secret_name,
            secret_object_value=secret_value
        )
