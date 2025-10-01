# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in KeepSafe, please report it to the maintainers directly at **security@keepsafe.example.com**. Do not open a public GitHub issue for security vulnerabilities.

We will respond within 48 hours to acknowledge your report and work with you to resolve the issue.

## Known Security Considerations

### Demo/MVP Nature
This project is a demonstration MVP with simplified authentication. The JWT implementation is a stub for demo purposes only.

**For Production Use:**
- Replace the demo JWT with a proper authentication system
- Implement secure session management
- Use environment-specific secrets (never commit secrets to version control)
- Enable HTTPS only

### Input Validation
All user inputs are validated using Zod schemas both client-side and server-side. However, always review validation rules for your specific use case.

### Database Security
- PII is minimal by design
- CORS is restricted to localhost by default
- Basic rate limiting is implemented
- Always use prepared statements (via pg parameterized queries)

### Third-Party API Risks
- CPSC, Health Canada, and EU Safety Gate data is provided "as-is"
- We display official recall URLs but do not provide legal/medical advice
- Always verify recall information with official sources

## Best Practices for Deployment

1. **Environment Variables**: Never commit `.env` files. Use secure secret management.
2. **CORS**: Configure CORS_ORIGIN to your production domain only.
3. **Rate Limiting**: Implement production-grade rate limiting (e.g., Redis-based).
4. **HTTPS**: Always use HTTPS in production.
5. **Database**: Enable SSL for Postgres connections in production.
6. **Backups**: Implement regular database backups.
7. **Monitoring**: Add logging and monitoring for security events.
8. **Dependencies**: Regularly update dependencies and scan for vulnerabilities.

## Responsible Disclosure

We believe in responsible disclosure. If you report a security issue to us, we commit to:
- Acknowledging your report within 48 hours
- Providing a timeline for fixes
- Crediting you (if desired) in release notes

## Contact

For security concerns, email: security@keepsafe.example.com