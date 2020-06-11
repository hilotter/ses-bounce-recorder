from diagrams import Cluster, Diagram, Edge
from diagrams.aws.engagement import SES
from diagrams.aws.integration import SNS
from diagrams.aws.compute import Lambda
from diagrams.onprem.compute import Server

with Diagram("SES Bounce Recorder", show=False):
  server = Server("some\nwebhook server")

  with Cluster("BounceRecorder"):
    fn = Lambda("Lambda")
    ses = SES("SES")
    sns = SNS("SNS\nBounceTopic")

  ses >> sns >> fn >> Edge(label="http\nrequest") >> server
