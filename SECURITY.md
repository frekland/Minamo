# Security policy

Minamo handles learning notes and potentially sensitive personal work. Please treat data isolation, stored content and the MCP write boundary as security-sensitive.

## Reporting a vulnerability

Please **do not post exploit details, credentials or real user records in public issues**. Use GitHub's private vulnerability-reporting or security-advisory channel if enabled for the repository. If it is unavailable, first contact the maintainer privately through GitHub to agree a secure reporting route. There is no guaranteed response time or commercial support commitment.

Reports are most useful with affected code, a synthetic reproduction, expected and observed behaviour, and an explanation of potential impact. Do not test against another person's account or the private production Site.

## Current boundaries

- Hosted identity is supplied by ChatGPT Sites, with separate host admission and per-user data access checks. **Do not treat client-supplied auth headers as trustworthy outside that hosting boundary.**
- D1 holds application records and mutation history; R2 holds assets. Neither should be populated with real learner data in this source repository.
- Commands use owner-scoped checks and revision/idempotency controls; exact reading selections are validated against retained text.
- Browser practice tools are bounded demonstrations, not general-purpose secure sandboxes for hostile code.
- Local preview uses synthetic identities and is not production authentication.
- The open-source packaging is not yet independently assessed as a generic self-hosted deployment.

See [Architecture](docs/ARCHITECTURE.md) and [Deployment](docs/DEPLOYMENT.md). Any new hosting or identity integration needs its own threat model and testing before real users are admitted.
