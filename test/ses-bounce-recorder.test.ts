import { Template } from "aws-cdk-lib/assertions"
import * as cdk from "aws-cdk-lib"
import { SesBounceRecorderStack } from "../lib/ses-bounce-recorder-stack"

describe("SesBounceRecorderStack", () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    process.env.BOUNCE_RECORDER_SNS_TOPIC = "ses-notifications"
    process.env.WEBHOOK_KEY = "test-key"
    process.env.WEBHOOK_URL = "https://example.com"
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test("sns", () => {
    const template = getTemplate()
    template.hasResourceProperties("AWS::SNS::Topic", {
      TopicName: "ses-notifications",
    })
  })

  test("lambda", () => {
    const template = getTemplate()
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "SesBounceRecorder",
      Runtime: "nodejs16.x",
      Environment: {
        Variables: {
          WEBHOOK_KEY: "test-key",
          WEBHOOK_URL: "https://example.com"
        }
      },
    })
  })

  test("snapshot", () => {
    const template = getTemplate().toJSON()
    expect(template).toMatchSnapshot()
  })
})

function getTemplate(): Template {
  const app = new cdk.App()

  const sesBounceRecorderStack = new SesBounceRecorderStack(app, "SesBounceRecorderStack")

  return Template.fromStack(sesBounceRecorderStack)
}
