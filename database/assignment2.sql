----A sql file containing six queries as described in Task One.
--(1).-Insert the following new record to the account table Tony, Stark, tony@starkent.com, Iam1ronM@n
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
--(2).-Modify the Tony Stark record to change the account_type to "Admin".
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1
    and account_firstname = 'Tony';
--(3).-Delete the Tony Stark record from the database.
DELETE FROM public.account
WHERE account_id = 1
    and account_firstname = 'Tony';
--(4).-Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query. 
UPDATE public.inventory
SET inv_description = REPLACE (
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;
--(5).-Use an inner join to select the make and model fields from the inventory table and the classification name field from the classification table for inventory items that belong to the "Sport" category.
SELECT I.inv_make,
    I.inv_model,
    C.classification_name
FROM public.inventory AS I
    INNER JOIN public.classification AS C ON C.classification_id = I.classification_id
WHERE I.classification_id = 2;
--(6).-Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns using a single query.
UPDATE public.inventory
SET inv_image = REPLACE(inv_image,'images','images/vehicles'),
	inv_thumbnail = REPLACE(inv_thumbnail,'images','images/vehicles');
