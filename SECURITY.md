# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in KeepSafe, please report it by emailing the maintainers. Please do not open a public issue.

## Known Considerations

### AI-Generated Code

This project was initially generated using AI assistance (Lovable). While efforts have been made to review and secure the codebase, users should be aware that:

1. **Code Review**: All code should be reviewed before deployment to production
2. **Security Audits**: Regular security audits are recommended
3. **Dependencies**: Keep all dependencies up to date
4. **Testing**: Comprehensive testing is essential

### Security Best Practices Implemented

- ✅ Row Level Security (RLS) on all database tables
- ✅ Input validation using Zod schemas
- ✅ Secure authentication via Supabase Auth
- ✅ Private storage buckets for receipt photos
- ✅ CORS restrictions on Edge Functions
- ✅ No sensitive data logged to console in production

### Potential Risks

Users should be aware of the following:

1. **Third-Party APIs**: The app calls external APIs (CPSC, Health Canada) which could be compromised
2. **Browser APIs**: Barcode scanning uses browser APIs that may have security implications
3. **File Uploads**: Receipt photos are stored in Supabase Storage - ensure proper access controls
4. **Edge Functions**: Public edge functions should validate all inputs

### Recommended Security Measures

For production deployments:

1. **Environment Variables**: Never commit secrets to version control
2. **CORS**: Restrict CORS to your production domain only
3. **Rate Limiting**: Implement rate limiting on Edge Functions
4. **Input Sanitization**: Validate and sanitize all user inputs
5. **HTTPS Only**: Always use HTTPS in production
6. **Regular Updates**: Keep all dependencies updated
7. **Backup Strategy**: Implement regular database backups
8. **Monitoring**: Set up logging and monitoring for suspicious activity

### Responsible Disclosure

If you discover a security issue:

1. **Do not** disclose it publicly until it has been addressed
2. Provide detailed information about the vulnerability
3. Allow reasonable time for the issue to be fixed
4. We will acknowledge your contribution in our security advisories (if desired)

### Context: Lovable Platform

This project was built using Lovable, an AI-powered development platform. While Lovable has been misused by threat actors in the past, this specific project:

- Is not hosted on Lovable infrastructure in production
- Has been reviewed for security best practices
- Implements standard security measures
- Does not include any malicious code

Users are encouraged to review the codebase and implement additional security measures as needed for their specific use case.

## Security Checklist for Production

Before deploying to production, ensure:

- [ ] All environment variables are secured
- [ ] CORS is restricted to production domain
- [ ] Rate limiting is enabled
- [ ] All user inputs are validated
- [ ] RLS policies are tested and verified
- [ ] Storage buckets have proper access controls
- [ ] Edge Functions validate all inputs
- [ ] HTTPS is enforced
- [ ] Dependencies are up to date
- [ ] Monitoring and logging are configured
- [ ] Backup strategy is in place
- [ ] Security headers are configured

## Contact

For security concerns, please contact the project maintainers through the appropriate channels.

---

**Last Updated**: January 2025
