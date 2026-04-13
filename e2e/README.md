# End-to-end tests

Here you can find selenium test for some of the site features that cannot be
tested with the unit tests:
* Authentication
* Login/Logout
* Submitting an order
* Submitting an order with a custom billing address
* etc.

## Running the tests

For now, you need to prepare the environment yourself: geoshop-back, geoshop-front and
zitadel authentication.

## Known issues

* Tests are not yet integrated with the CI/CD pipeline
* test_i18n_login.py requires running a geoshop-front docker instance, because
the i18n is configured at the nginx level.
