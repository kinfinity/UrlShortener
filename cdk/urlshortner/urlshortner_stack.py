from constructs import Construct

from aws_cdk import (
    Stack,
    aws_iam as iam,
    aws_ec2 as ec2,
    aws_ecr as ecr,
    aws_lambda as _lambda
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

        # Create a Lambda function with VPC configuration
        lambda_function = _lambda.DockerImageFunction(
            self,
            "UrlShortnerProxyLambda",
            # handler= _lambda.Handler.FROM_IMAGE,
            # runtime = _lambda.Runtime.FROM_IMAGE,
            code=_lambda.DockerImageCode.from_ecr(ecr_repo),# .repository_uri_for_tag("url-shortner:latest-dev")
            vpc=vpc,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PRIVATE_ISOLATED),
            allow_all_outbound=True,
        )