from constructs import Construct

from aws_cdk import (
    Stack,
    aws_ec2 as ec2
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
