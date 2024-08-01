import { SSM } from "@aws-sdk/client-ssm";

const client = new SSM();

const getParameter = async (parameterName) => {
  const result = await client.getParameter({
    Name: `${parameterName}`,
    WithDecryption: true,
  });

  return result.Parameter.Value;
};

export default { getParameter };
