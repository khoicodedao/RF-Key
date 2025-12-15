import fs from "fs";
import https from "https";

/**
 * Return an https.Agent configured with client cert/key and optional CA
 * if files exist under CERT_DIR (defaults to /nginx.certs).
 *
 * Environment:
 * - CERT_DIR: directory containing client.crt, client.key (optional ca.crt)
 * - REQUIRE_SERVER_VERIFY: if 'true' the agent will verify server certs; default is NO verification
 */
export function getHttpsAgentIfPresent(): https.Agent | undefined {
  try {
    const dir = process.env.CERT_DIR || "/nginx.certs";
    const certPath = `${dir}/client.crt`;
    const keyPath = `${dir}/client.key`;
    const caPath = `${dir}/ca.crt`;

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) return undefined;

    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);
    const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined;

    // Default: do NOT verify server certificate unless explicitly requested.
    // Set REQUIRE_SERVER_VERIFY=true to enable server cert validation (recommended for production).
    const rejectUnauthorized = process.env.REQUIRE_SERVER_VERIFY === "true";

    const agentOptions: https.AgentOptions = {
      cert,
      key,
      rejectUnauthorized,
    };
    if (ca) (agentOptions as any).ca = ca;

    return new https.Agent(agentOptions);
  } catch (e) {
    // If anything goes wrong, fall back to undefined so axios uses default agent
    // eslint-disable-next-line no-console
    console.warn(
      "backend-agent: unable to create https.Agent:",
      e?.message || e,
    );
    return undefined;
  }
}
