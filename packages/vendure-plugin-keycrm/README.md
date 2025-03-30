# Keycrm Plugin for Vendure

A plugin to use [keycrm.app](https://ua.keycrm.app/) as a single source of truth for:

- Products and Variants (Keycrm: Offers)
- Collections (Keycrm: Categories)
- Customers (Keycrm: Buyer)
- Orders

## Migration workflow

This plugin changes the [custom fields](https://docs.vendure.io/guides/developer-guide/custom-fields/) configuration by extending the product fields by a custom field for the dedicated product ID within the Keycrm.

Therefor a database migration is needed. Check the vendure documentation for a detailed description of the [Migration workflow](https://docs.vendure.io/guides/developer-guide/migrations/#migration-workflow).
