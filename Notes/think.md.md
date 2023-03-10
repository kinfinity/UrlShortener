# UrlShortner

*Project Setup*

**Thought Process**
infrastructure
- apigateway
  > custom url (route53)
- vpc + subnets & routing
- secrets manager
- dynamodb + dax cache
- lambda
  > dynamodb access
  > ecr access? 
    ! image version in cdk
- route53 hostedzone & domain
- pipeline user + role with permissions 


cicd 
- linting(locally) + type checking
- build typescript
- run tests
- build Docker image for typescript
- create ecr & push image
- cdk synth

proxy-lambda
- get requests from apigateway
- filter requests for different paths
- use different controllers for different paths
- Load credentials from secrets manager
- connections: db & cache
- readers & writers: db + cache | removed this due to time
- hit cache -> hit db -> cache save/update (process to validate for cache)
- shortner hashing + optimize
    - 
- cache record size

