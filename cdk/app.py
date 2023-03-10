#!/usr/bin/env python3

import aws_cdk as cdk

from urlshortner.urlshortner_stack import UrlShortnerStack

app = cdk.App()
env = app.node.try_get_context("env")
aws_account = app.node.try_get_context(env)["account"]
aws_env = cdk.Environment(account= aws_account, region = app.node.try_get_context(env)["region"])
UrlShortnerStack(app, "urlshortner-stack")

app.synth()
