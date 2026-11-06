# Form integration boundary

## Current state

No form delivery backend is configured. The contact fields and submit control are disabled in the HTML, the JavaScript disables them again and prevents submission, and the deployment policy has `form-action 'none'`. The code never reads or stores the disabled fields or sends a form request. The public configuration has no form destination or credential fields.

This is a safe disabled state, not a functioning enquiry service. There is no claim that CAPTCHA, rate limiting or a server-to-server delivery integration has already been installed.

## Required delivery path before enabling

The browser submits over HTTPS to a reviewed same-origin endpoint. That endpoint validates the request and the anti-bot token, applies server-side abuse controls and forwards accepted enquiries over HTTPS to the selected private delivery service. Only that server has the delivery credentials.

The public endpoint address and CAPTCHA site key are not secrets. Write tokens, CAPTCHA secret keys, mail credentials, delivery-service authorization and deployment hooks must never be included in browser bundles or public configuration. Store them in server environment variables or private hosting configuration outside the served directory. Never make the browser write submissions directly to Sanity.

The backend must have these controls before the form is enabled:

| Boundary | Required control |
| --- | --- |
| Browser request | Same-origin HTTPS POST, explicit supported content type and a small request-size limit. Do not put enquiry fields in query strings. |
| Input | Allow only named fields; validate type, length, email syntax and consent on the server. Reject unexpected fields and email-header control characters. |
| Bots and floods | Validate a Turnstile/reCAPTCHA response on the server, including expected hostname/action where supported. Use a server-checked honeypot and persistent/shared rate limits. Do not rely on a browser counter or one serverless instance's memory. |
| Cross-site requests | Check an exact allowed Origin for browser submissions. Do not enable wildcard credentialed CORS. Add appropriate CSRF protection if authentication cookies are involved. |
| Outbound delivery | Use a fixed server-configured recipient/service endpoint. Never let submitted fields select recipients, upstream URLs or credentials. Use bounded timeouts and handle upstream failures without claiming success. |
| Private data | Keep submissions out of the public editorial dataset, browser storage, analytics events and routine request logs. Use the selected private destination's retention and access controls. |
| Credentials | Use narrowly scoped server credentials. Treat leaked credentials as compromised and rotate them. Do not return them or upstream error bodies to the visitor. |
| Release | Add backend tests and update the form-mode build guard, browser transport, endpoint deployment and CSP deliberately. Verify the complete flow on the chosen host before enabling the controls. |

For Hostinger, this can be a server-side PHP endpoint. Vercel requires a compatible server function or a reviewed form service; uploading a PHP file to a static Vercel output does not supply a PHP backend. The actual provider, destination, CAPTCHA keys and hosting settings still need configuration. No external messages or submissions have been sent during this work.

## Public content reads

Public editorial content is separate from form writes. Browser content requests use the Sanity API CDN with GET, `credentials: 'omit'` and rejected redirects. The site does not send a Sanity bearer token from the browser. Build-time requests can use the uncached API to generate fresh article HTML; any optional read token is build-only and is excluded from public output.

The server deployment policy permits connections to the configured Sanity CDN and the same site, and excludes the live database API from browser connections. Public API URLs and project IDs can remain visible: hiding those addresses is not an authorization control.

References: [Sanity token and frontend submission guidance](https://www.sanity.io/docs/content-lake/keeping-your-data-safe), [OWASP input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
