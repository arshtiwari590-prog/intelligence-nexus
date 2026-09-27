-- Add UNIQUE constraints if they don't exist
ALTER TABLE companies
ADD CONSTRAINT companies_name_unique UNIQUE (name);

ALTER TABLE people
ADD CONSTRAINT people_email_unique UNIQUE (email);
