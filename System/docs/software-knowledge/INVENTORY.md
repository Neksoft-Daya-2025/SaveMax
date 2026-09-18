# Source inventory

Regenerate with `node scripts/software-inventory.cjs` from System. This reads source without starting the app or accessing its database. Generated inventory is a snapshot, not proof of working features or authorization.

Coverage: 229 application/config source files, 73 page routes, 72 API route files, 23 model files.

## Pages

| Route | Source |
|---|---|
| `/login` | [app/(auth)/login/page.tsx](../../app/(auth)/login/page.tsx) |
| `/register` | [app/(auth)/register/page.tsx](../../app/(auth)/register/page.tsx) |
| `/setup` | [app/(auth)/setup/page.tsx](../../app/(auth)/setup/page.tsx) |
| `/create-organization` | [app/(landing)/create-organization/page.tsx](../../app/(landing)/create-organization/page.tsx) |
| `/` | [app/(landing)/page.tsx](../../app/(landing)/page.tsx) |
| `/property/[id]` | [app/(landing)/property/[id]/page.tsx](../../app/(landing)/property/[id]/page.tsx) |
| `/unit/[id]` | [app/(landing)/unit/[id]/page.tsx](../../app/(landing)/unit/[id]/page.tsx) |
| `/agents/[id]` | [app/agents/[id]/page.tsx](../../app/agents/[id]/page.tsx) |
| `/agents` | [app/agents/page.tsx](../../app/agents/page.tsx) |
| `/ai-reports` | [app/ai-reports/page.tsx](../../app/ai-reports/page.tsx) |
| `/amenities` | [app/amenities/page.tsx](../../app/amenities/page.tsx) |
| `/blogs/edit/[id]` | [app/blogs/edit/[id]/page.tsx](../../app/blogs/edit/[id]/page.tsx) |
| `/blogs/new` | [app/blogs/new/page.tsx](../../app/blogs/new/page.tsx) |
| `/blogs` | [app/blogs/page.tsx](../../app/blogs/page.tsx) |
| `/bookings` | [app/bookings/page.tsx](../../app/bookings/page.tsx) |
| `/contracts/[id]` | [app/contracts/[id]/page.tsx](../../app/contracts/[id]/page.tsx) |
| `/contracts/active` | [app/contracts/active/page.tsx](../../app/contracts/active/page.tsx) |
| `/contracts/create` | [app/contracts/create/page.tsx](../../app/contracts/create/page.tsx) |
| `/contracts/edit/[id]` | [app/contracts/edit/[id]/page.tsx](../../app/contracts/edit/[id]/page.tsx) |
| `/contracts/expiring` | [app/contracts/expiring/page.tsx](../../app/contracts/expiring/page.tsx) |
| `/contracts` | [app/contracts/page.tsx](../../app/contracts/page.tsx) |
| `/customer-dashboard` | [app/customer-dashboard/page.tsx](../../app/customer-dashboard/page.tsx) |
| `/customers/[id]/payments` | [app/customers/[id]/payments/page.tsx](../../app/customers/[id]/payments/page.tsx) |
| `/customers/active` | [app/customers/active/page.tsx](../../app/customers/active/page.tsx) |
| `/customers/create` | [app/customers/create/page.tsx](../../app/customers/create/page.tsx) |
| `/customers` | [app/customers/page.tsx](../../app/customers/page.tsx) |
| `/dashboard` | [app/dashboard/page.tsx](../../app/dashboard/page.tsx) |
| `/deposits` | [app/deposits/page.tsx](../../app/deposits/page.tsx) |
| `/deposits/record` | [app/deposits/record/page.tsx](../../app/deposits/record/page.tsx) |
| `/due-collection` | [app/due-collection/page.tsx](../../app/due-collection/page.tsx) |
| `/expenses` | [app/expenses/page.tsx](../../app/expenses/page.tsx) |
| `/inquiries` | [app/inquiries/page.tsx](../../app/inquiries/page.tsx) |
| `/maintenance/emergency` | [app/maintenance/emergency/page.tsx](../../app/maintenance/emergency/page.tsx) |
| `/maintenance/in-progress` | [app/maintenance/in-progress/page.tsx](../../app/maintenance/in-progress/page.tsx) |
| `/maintenance` | [app/maintenance/page.tsx](../../app/maintenance/page.tsx) |
| `/my-contracts` | [app/my-contracts/page.tsx](../../app/my-contracts/page.tsx) |
| `/owners` | [app/owners/page.tsx](../../app/owners/page.tsx) |
| `/payments/invoice/[id]` | [app/payments/invoice/[id]/page.tsx](../../app/payments/invoice/[id]/page.tsx) |
| `/payments` | [app/payments/page.tsx](../../app/payments/page.tsx) |
| `/payments/record` | [app/payments/record/page.tsx](../../app/payments/record/page.tsx) |
| `/payroll` | [app/payroll/page.tsx](../../app/payroll/page.tsx) |
| `/profile` | [app/profile/page.tsx](../../app/profile/page.tsx) |
| `/properties/[id]` | [app/properties/[id]/page.tsx](../../app/properties/[id]/page.tsx) |
| `/properties/create` | [app/properties/create/page.tsx](../../app/properties/create/page.tsx) |
| `/properties/edit/[id]` | [app/properties/edit/[id]/page.tsx](../../app/properties/edit/[id]/page.tsx) |
| `/properties` | [app/properties/page.tsx](../../app/properties/page.tsx) |
| `/property-assistant` | [app/property-assistant/page.tsx](../../app/property-assistant/page.tsx) |
| `/reports/collection` | [app/reports/collection/page.tsx](../../app/reports/collection/page.tsx) |
| `/reports/financial` | [app/reports/financial/page.tsx](../../app/reports/financial/page.tsx) |
| `/reports/rental` | [app/reports/rental/page.tsx](../../app/reports/rental/page.tsx) |
| `/roles/[id]` | [app/roles/[id]/page.tsx](../../app/roles/[id]/page.tsx) |
| `/roles/new` | [app/roles/new/page.tsx](../../app/roles/new/page.tsx) |
| `/roles` | [app/roles/page.tsx](../../app/roles/page.tsx) |
| `/settings` | [app/settings/page.tsx](../../app/settings/page.tsx) |
| `/staff` | [app/staff/page.tsx](../../app/staff/page.tsx) |
| `/superadmin/organizations/[id]` | [app/superadmin/organizations/[id]/page.tsx](../../app/superadmin/organizations/[id]/page.tsx) |
| `/superadmin/organizations/create` | [app/superadmin/organizations/create/page.tsx](../../app/superadmin/organizations/create/page.tsx) |
| `/superadmin/organizations` | [app/superadmin/organizations/page.tsx](../../app/superadmin/organizations/page.tsx) |
| `/superadmin` | [app/superadmin/page.tsx](../../app/superadmin/page.tsx) |
| `/superadmin/profile` | [app/superadmin/profile/page.tsx](../../app/superadmin/profile/page.tsx) |
| `/superadmin/settings` | [app/superadmin/settings/page.tsx](../../app/superadmin/settings/page.tsx) |
| `/superadmin/subscriptions` | [app/superadmin/subscriptions/page.tsx](../../app/superadmin/subscriptions/page.tsx) |
| `/superadmin/users` | [app/superadmin/users/page.tsx](../../app/superadmin/users/page.tsx) |
| `/superadmin/website-settings` | [app/superadmin/website-settings/page.tsx](../../app/superadmin/website-settings/page.tsx) |
| `/suppliers` | [app/suppliers/page.tsx](../../app/suppliers/page.tsx) |
| `/test-route` | [app/test-route/page.tsx](../../app/test-route/page.tsx) |
| `/units/[id]` | [app/units/[id]/page.tsx](../../app/units/[id]/page.tsx) |
| `/units/create` | [app/units/create/page.tsx](../../app/units/create/page.tsx) |
| `/units/edit/[id]` | [app/units/edit/[id]/page.tsx](../../app/units/edit/[id]/page.tsx) |
| `/units` | [app/units/page.tsx](../../app/units/page.tsx) |
| `/users/[id]` | [app/users/[id]/page.tsx](../../app/users/[id]/page.tsx) |
| `/users/new` | [app/users/new/page.tsx](../../app/users/new/page.tsx) |
| `/users` | [app/users/page.tsx](../../app/users/page.tsx) |

## API routes

Methods are exported handler names; access controls and middleware must be reviewed separately. Dynamic segments retain Next.js notation.

| Route | Methods | Source |
|---|---|---|
| `/api/agents/[id]` | GET, PUT, DELETE | [app/api/agents/[id]/route.ts](../../app/api/agents/[id]/route.ts) |
| `/api/agents` | GET, POST | [app/api/agents/route.ts](../../app/api/agents/route.ts) |
| `/api/ai-reports` | POST | [app/api/ai-reports/route.ts](../../app/api/ai-reports/route.ts) |
| `/api/amenities/[id]` | GET, PUT, DELETE | [app/api/amenities/[id]/route.ts](../../app/api/amenities/[id]/route.ts) |
| `/api/amenities` | GET, POST | [app/api/amenities/route.ts](../../app/api/amenities/route.ts) |
| `/api/auth/[...nextauth]` | GET, POST | [app/api/auth/[...nextauth]/route.ts](../../app/api/auth/[...nextauth]/route.ts) |
| `/api/auth/register` | POST | [app/api/auth/register/route.ts](../../app/api/auth/register/route.ts) |
| `/api/blogs/[id]` | GET, PUT, DELETE | [app/api/blogs/[id]/route.ts](../../app/api/blogs/[id]/route.ts) |
| `/api/blogs` | GET, POST | [app/api/blogs/route.ts](../../app/api/blogs/route.ts) |
| `/api/bookings/[id]` | GET, PUT, DELETE | [app/api/bookings/[id]/route.ts](../../app/api/bookings/[id]/route.ts) |
| `/api/bookings` | GET, POST | [app/api/bookings/route.ts](../../app/api/bookings/route.ts) |
| `/api/commissions` | GET, POST | [app/api/commissions/route.ts](../../app/api/commissions/route.ts) |
| `/api/contracts/[id]` | GET, PUT, DELETE | [app/api/contracts/[id]/route.ts](../../app/api/contracts/[id]/route.ts) |
| `/api/contracts` | GET, POST | [app/api/contracts/route.ts](../../app/api/contracts/route.ts) |
| `/api/customers/[id]` | GET, PUT, DELETE | [app/api/customers/[id]/route.ts](../../app/api/customers/[id]/route.ts) |
| `/api/customers` | GET, POST | [app/api/customers/route.ts](../../app/api/customers/route.ts) |
| `/api/debug` | GET | [app/api/debug/route.ts](../../app/api/debug/route.ts) |
| `/api/deposits/[id]` | GET, PUT, DELETE | [app/api/deposits/[id]/route.ts](../../app/api/deposits/[id]/route.ts) |
| `/api/deposits` | GET, POST | [app/api/deposits/route.ts](../../app/api/deposits/route.ts) |
| `/api/expenses/[id]` | PUT, DELETE | [app/api/expenses/[id]/route.ts](../../app/api/expenses/[id]/route.ts) |
| `/api/expenses` | GET, POST | [app/api/expenses/route.ts](../../app/api/expenses/route.ts) |
| `/api/inquiries/[id]` | GET, PUT, DELETE | [app/api/inquiries/[id]/route.ts](../../app/api/inquiries/[id]/route.ts) |
| `/api/inquiries` | GET, POST | [app/api/inquiries/route.ts](../../app/api/inquiries/route.ts) |
| `/api/maintenance/[id]` | GET, PUT, DELETE | [app/api/maintenance/[id]/route.ts](../../app/api/maintenance/[id]/route.ts) |
| `/api/maintenance` | GET, POST | [app/api/maintenance/route.ts](../../app/api/maintenance/route.ts) |
| `/api/owners/[id]` | GET, PUT, DELETE | [app/api/owners/[id]/route.ts](../../app/api/owners/[id]/route.ts) |
| `/api/owners` | GET, POST | [app/api/owners/route.ts](../../app/api/owners/route.ts) |
| `/api/payments/[id]` | GET, PUT, DELETE | [app/api/payments/[id]/route.ts](../../app/api/payments/[id]/route.ts) |
| `/api/payments` | GET, POST | [app/api/payments/route.ts](../../app/api/payments/route.ts) |
| `/api/payroll/[id]` | GET, PUT, DELETE | [app/api/payroll/[id]/route.ts](../../app/api/payroll/[id]/route.ts) |
| `/api/payroll` | GET, POST | [app/api/payroll/route.ts](../../app/api/payroll/route.ts) |
| `/api/profile` | GET, PUT | [app/api/profile/route.ts](../../app/api/profile/route.ts) |
| `/api/properties/[id]` | GET, PUT, DELETE | [app/api/properties/[id]/route.ts](../../app/api/properties/[id]/route.ts) |
| `/api/properties` | GET, POST | [app/api/properties/route.ts](../../app/api/properties/route.ts) |
| `/api/property-assistant` | GET, POST | [app/api/property-assistant/route.ts](../../app/api/property-assistant/route.ts) |
| `/api/public/bookings` | POST | [app/api/public/bookings/route.ts](../../app/api/public/bookings/route.ts) |
| `/api/public/landing` | GET | [app/api/public/landing/route.ts](../../app/api/public/landing/route.ts) |
| `/api/public/organizations` | POST | [app/api/public/organizations/route.ts](../../app/api/public/organizations/route.ts) |
| `/api/public/plans` | GET | [app/api/public/plans/route.ts](../../app/api/public/plans/route.ts) |
| `/api/public/property/[id]` | GET | [app/api/public/property/[id]/route.ts](../../app/api/public/property/[id]/route.ts) |
| `/api/public/unit/[id]` | GET | [app/api/public/unit/[id]/route.ts](../../app/api/public/unit/[id]/route.ts) |
| `/api/public/website-settings` | GET | [app/api/public/website-settings/route.ts](../../app/api/public/website-settings/route.ts) |
| `/api/reports/collection` | GET | [app/api/reports/collection/route.ts](../../app/api/reports/collection/route.ts) |
| `/api/reports/financial` | GET | [app/api/reports/financial/route.ts](../../app/api/reports/financial/route.ts) |
| `/api/reports/rental` | GET | [app/api/reports/rental/route.ts](../../app/api/reports/rental/route.ts) |
| `/api/roles/[id]` | GET, PUT, DELETE | [app/api/roles/[id]/route.ts](../../app/api/roles/[id]/route.ts) |
| `/api/roles` | GET, POST | [app/api/roles/route.ts](../../app/api/roles/route.ts) |
| `/api/seed-admin` | GET | [app/api/seed-admin/route.ts](../../app/api/seed-admin/route.ts) |
| `/api/seed-permissions` | GET | [app/api/seed-permissions/route.ts](../../app/api/seed-permissions/route.ts) |
| `/api/settings/backup` | GET | [app/api/settings/backup/route.ts](../../app/api/settings/backup/route.ts) |
| `/api/settings` | GET, PUT | [app/api/settings/route.ts](../../app/api/settings/route.ts) |
| `/api/setup` | POST, GET | [app/api/setup/route.ts](../../app/api/setup/route.ts) |
| `/api/staff/[id]` | PUT, DELETE | [app/api/staff/[id]/route.ts](../../app/api/staff/[id]/route.ts) |
| `/api/staff` | GET, POST | [app/api/staff/route.ts](../../app/api/staff/route.ts) |
| `/api/superadmin/faqs/[id]` | GET, PUT, DELETE | [app/api/superadmin/faqs/[id]/route.ts](../../app/api/superadmin/faqs/[id]/route.ts) |
| `/api/superadmin/faqs` | GET, POST | [app/api/superadmin/faqs/route.ts](../../app/api/superadmin/faqs/route.ts) |
| `/api/superadmin/organizations/[id]` | GET, PUT, DELETE | [app/api/superadmin/organizations/[id]/route.ts](../../app/api/superadmin/organizations/[id]/route.ts) |
| `/api/superadmin/organizations` | GET, POST | [app/api/superadmin/organizations/route.ts](../../app/api/superadmin/organizations/route.ts) |
| `/api/superadmin/reviews/[id]` | GET, PUT, DELETE | [app/api/superadmin/reviews/[id]/route.ts](../../app/api/superadmin/reviews/[id]/route.ts) |
| `/api/superadmin/reviews` | GET, POST | [app/api/superadmin/reviews/route.ts](../../app/api/superadmin/reviews/route.ts) |
| `/api/superadmin/settings` | GET, PUT | [app/api/superadmin/settings/route.ts](../../app/api/superadmin/settings/route.ts) |
| `/api/superadmin/stats` | GET | [app/api/superadmin/stats/route.ts](../../app/api/superadmin/stats/route.ts) |
| `/api/superadmin/users` | GET | [app/api/superadmin/users/route.ts](../../app/api/superadmin/users/route.ts) |
| `/api/superadmin/website-settings` | GET, PUT | [app/api/superadmin/website-settings/route.ts](../../app/api/superadmin/website-settings/route.ts) |
| `/api/suppliers/[id]` | GET, PUT, DELETE | [app/api/suppliers/[id]/route.ts](../../app/api/suppliers/[id]/route.ts) |
| `/api/suppliers` | GET, POST | [app/api/suppliers/route.ts](../../app/api/suppliers/route.ts) |
| `/api/test-db` | GET | [app/api/test-db/route.ts](../../app/api/test-db/route.ts) |
| `/api/units/[id]` | GET, PUT, DELETE | [app/api/units/[id]/route.ts](../../app/api/units/[id]/route.ts) |
| `/api/units` | GET, POST | [app/api/units/route.ts](../../app/api/units/route.ts) |
| `/api/users/[id]` | GET, PUT, DELETE | [app/api/users/[id]/route.ts](../../app/api/users/[id]/route.ts) |
| `/api/users/by-role` | GET | [app/api/users/by-role/route.ts](../../app/api/users/by-role/route.ts) |
| `/api/users` | GET, POST | [app/api/users/route.ts](../../app/api/users/route.ts) |

## Models

Fields are top-level fields of each literal Schema declaration, including nested schema declarations when present. Follow source links for types, validation, defaults, indexes, hooks and nested fields. References are literal Mongoose ref declarations.

### Amenity

Source: [models/Amenity.ts](../../models/Amenity.ts). References: Organization, User.

Schema at line 16: `name`, `icon`, `status`, `organization`, `createdBy`.

### BlogPost

Source: [models/BlogPost.ts](../../models/BlogPost.ts). References: Organization, User.

Schema at line 27: `title`, `slug`, `organization`, `content`, `excerpt`, `thumbnail`, `author`, `category`, `tags`, `status`, `seo`, `isFeatured`.

### Booking

Source: [models/Booking.ts](../../models/Booking.ts). References: Organization, Property, Unit, User.

Schema at line 21: `organization`, `property`, `unit`, `customer`, `agent`, `visitDate`, `visitTime`, `status`, `message`, `adminNotes`.

### Commission

Source: [models/Commission.ts](../../models/Commission.ts). References: Organization, User, Property, Contract, Payment.

Schema at line 22: `organization`, `agent`, `property`, `contract`, `payment`, `amount`, `rate`, `type`, `status`, `paidDate`, `notes`.

### Contract

Source: [models/Contract.ts](../../models/Contract.ts). References: Property, Unit, Organization, User.

Schema at line 33: `property`, `unit`, `type`, `organization`, `parties`, `details`, `status`, `documents`.

### Customer

Source: [models/Customer.ts](../../models/Customer.ts). References: Organization, User.

Schema at line 16: `name`, `email`, `phone`, `address`, `notes`, `totalPurchases`, `organization`, `createdBy`, `status`.

### Deposit

Source: [models/Deposit.ts](../../models/Deposit.ts). References: Organization, Property, Unit, Contract, Customer, User.

Schema at line 27: `organization`, `property`, `unit`, `contract`, `client`, `amount`, `receivedAmount`, `paymentMethod`, `status`, `type`, `transactionId`, `receiptNumber`, `refundedAmount`, `refundDate`, `processedBy`, `notes`.

### Expense

Source: [models/Expense.ts](../../models/Expense.ts). References: Organization, User.

Schema at line 17: `title`, `amount`, `category`, `date`, `reference`, `notes`, `paymentMethod`, `organization`, `recordedBy`.

### FAQ

Source: [models/FAQ.ts](../../models/FAQ.ts). References: none detected.

Schema at line 14: `question`, `answer`, `category`, `order`, `isActive`.

### Inquiry

Source: [models/Inquiry.ts](../../models/Inquiry.ts). References: Organization, Property, Unit, User.

Schema at line 26: `organization`, `property`, `unit`, `name`, `email`, `phone`, `message`, `status`, `agent`, `customer`, `notes`.

### Maintenance

Source: [models/Maintenance.ts](../../models/Maintenance.ts). References: Organization, Property, Unit, User.

Schema at line 26: `title`, `description`, `organization`, `property`, `unit`, `priority`, `status`, `type`, `requestedBy`, `assignedTo`, `cost`, `images`, `scheduledDate`, `completedDate`, `notes`.

### Organization

Source: [models/Organization.ts](../../models/Organization.ts). References: User.

Schema at line 62: `name`, `slug`, `email`, `phone`, `address`, `logoUrl`, `website`, `status`, `subscription`, `adminUser`, `settings`, `stats`.

### Payment

Source: [models/Payment.ts](../../models/Payment.ts). References: Property, Unit, Contract, User, Organization.

Schema at line 35: `property`, `unit`, `contract`, `client`, `organization`, `amount`, `receivedAmount`, `totalAmount`, `paymentType`, `paymentMethod`, `status`, `transactionId`, `billingMonth`, `billingYear`, `invoiceNumber`, `processedBy`, `notes`, `depositHistory`.

### Payroll

Source: [models/Payroll.ts](../../models/Payroll.ts). References: Organization, Staff, Booking.

Schema at line 31: `organization`, `staff`, `month`, `year`, `baseSalary`, `totalCommission`, `totalTips`, `bonuses`, `deductions`, `totalAmount`, `status`, `paidDate`, `paymentMethod`, `notes`, `breakdown`.

### Property

Source: [models/Property.ts](../../models/Property.ts). References: User, Organization.

Schema at line 74: `title`, `description`, `propertyType`, `purpose`, `status`, `price`, `isNegotiable`, `areaSize`, `areaUnit`, `bedrooms`, `bathrooms`, `parking`, `floor`, `unit`, `block`, `age`, `possessionDate`, `location`, `nearbyPlaces`, `amenities`, `images`, `videos`, `documents`, `floorPlans`, `virtualTourUrl`, `isFeatured`, `isHot`, `agent`, `owner`, `seo`, `organization`, `createdBy`.

### Review

Source: [models/Review.ts](../../models/Review.ts). References: none detected.

Schema at line 19: `author`, `role`, `company`, `units`, `content`, `rating`, `avatarUrl`, `order`, `isActive`, `isFeatured`.

### Role

Source: [models/Role.ts](../../models/Role.ts). References: Organization.

Schema at line 48: `name`, `organization`, `description`, `isSystem`, `permissions`.

### SaaSSettings

Source: [models/SaaSSettings.ts](../../models/SaaSSettings.ts). References: none detected.

Schema at line 97: `id`, `name`, `price`, `currency`, `billingInterval`, `description`, `features`, `badge`, `discountNotice`, `isActive`.
Schema at line 113: `logoUrl`, `brandTitle`, `brandBadge`, `brandSubtitle`, `badgeText`, `heroTitle`, `heroSubtitle`, `primaryCtaText`, `secondaryCtaText`, `metrics`, `featuresBadge`, `featuresTitle`, `featuresSubtitle`, `modulesBadge`, `modulesTitle`, `modulesSubtitle`, `pricingBadge`, `pricingTitle`, `pricingSubtitle`, `registrationBadge`, `registrationTitle`, `registrationSubtitle`, `testimonialsBadge`, `testimonialsTitle`, `testimonialsSubtitle`, `faqBadge`, `faqTitle`, `faqSubtitle`, `ctaBannerTitle`, `ctaBannerSubtitle`, `ctaBannerButtonText`, `footerDescription`, `footerCopyright`.
Schema at line 282: `platformName`, `supportEmail`, `phone`, `address`, `currency`, `timezone`, `trialDays`, `plans`, `landingPage`.

### Settings

Source: [models/Settings.ts](../../models/Settings.ts). References: none detected.

Schema at line 4: `storeName`, `address`, `phone`, `email`, `website`, `taxId`, `currency`, `timezone`, `taxRate`, `logoUrl`, `businessHours`, `receiptFooter`, `termsAndConditions`, `smsEnabled`, `twilioAccountSid`, `twilioAuthToken`, `twilioPhoneNumber`, `emailEnabled`, `smtpHost`, `smtpPort`, `smtpSecure`, `smtpUser`, `smtpPassword`, `smtpFrom`, `reminderDaysBefore`, `reminderMethod`, `aiEnabled`, `openaiApiKey`, `openaiModel`, `siteSeo`.

### Staff

Source: [models/Staff.ts](../../models/Staff.ts). References: Organization, User.

Schema at line 24: `organization`, `name`, `email`, `phone`, `userId`, `designation`, `skills`, `salary`, `joinDate`, `isActive`, `workingDays`.

### Supplier

Source: [models/Supplier.ts](../../models/Supplier.ts). References: Organization, User.

Schema at line 18: `name`, `organization`, `contactPerson`, `email`, `phone`, `address`, `createdBy`, `status`.

### Unit

Source: [models/Unit.ts](../../models/Unit.ts). References: Property, User, Organization.

Schema at line 30: `property`, `unitNumber`, `block`, `floor`, `type`, `price`, `areaSize`, `bedrooms`, `bathrooms`, `windows`, `status`, `features`, `images`, `isCorner`, `facing`, `owner`, `tenant`, `organization`, `createdBy`.

### User

Source: [models/User.ts](../../models/User.ts). References: Role, Organization, User.

Schema at line 51: `name`, `email`, `password`, `phone`, `profileImage`, `role`, `isSuperAdmin`, `organization`, `status`, `emailVerified`, `agentDetails`, `ownerDetails`, `customerDetails`.

## Environment variable names

Names only; values and secrets are intentionally excluded. Presence in code does not mean the integration is configured.

- `DEMO`
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_DEMO`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NODE_ENV`
- `SMTP_FROM`
- `SMTP_HOST`
- `SMTP_PASS`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## Coverage limits

Includes app, components, models, lib, hooks, types and root JavaScript/TypeScript files. Excludes dependencies, generated output, uploaded assets, sibling Brain, scripts and non-code configuration. AST extraction covers named exported handlers and literal Schema fields; computed schemas, aliases and runtime-generated routes require manual review.
