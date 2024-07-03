// Import required CDK modules
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// Define a CDK app
const app = new cdk.App();

// Define a CDK stack
const stack = new cdk.Stack(app, 'EcsFargateServiceStack', {
  description: 'ECS Fargate Service Stack',
});

// Create a VPC for ECS
const vpc = new ec2.Vpc(stack, 'MyVpc', {
  maxAzs: 2, // Specify the number of Availability Zones you want to use
});

// Create an ECS cluster
const cluster = new ecs.Cluster(stack, 'Iynfluencer', {
  vpc,
});

// Define a task definition
const taskDefinition = new ecs.FargateTaskDefinition(stack, 'iynfluencer-user', {
  memoryLimitMiB: 512,
  cpu: 256,
});

// Add a container to the task definition
taskDefinition.addContainer('MyContainer', {
  image: ecs.ContainerImage.fromRegistry('iynfluencer_user'), // Replace with your Docker image URL
  memoryLimitMiB: 512,
  cpu: 256,
});

// Define an ECS service
new ecs.FargateService(stack, 'iynfluencer-user-service', {
  cluster,
  taskDefinition,
  desiredCount: 1, // Number of desired tasks
});

// Output the URL of the load balancer (if used)
if (cluster.defaultCloudMapNamespace) {
  new cdk.CfnOutput(stack, 'LoadBalancerDNS', {
    value: cluster.defaultCloudMapNamespace.namespaceName,
  });
}
