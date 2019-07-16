# [Load m Up](https://gitlab.com/GCSBOSS/load-m-up)

A RESTful service specialized in receiving and managing web file uploads.

## Get Started

1. Install with: `npm i -g load-m-up`.
2. Optionally point `LOADMUP_CONF` env var to a TOML [config file](#configuration).
3. Run with: `load-m-up`.

## Reporting Bugs
If you have found any problems with this module, please:

1. [Open an issue](https://gitlab.com/GCSBOSS/load-m-up/issues/new).
2. Describe what happened and how.
3. Also in the issue text, reference the label `~bug`.

We will make sure to take a look when time allows us.

## Proposing Features
If you wish to get that awesome feature or have some advice for us, please:
1. [Open an issue](https://gitlab.com/GCSBOSS/load-m-up/issues/new).
2. Describe your ideas.
3. Also in the issue text, reference the label `~proposal`.

## Contributing
If you have spotted any enhancements to be made and is willing to get your hands
dirty about it, fork us and
[submit your merge request](https://gitlab.com/GCSBOSS/load-m-up/merge_requests/new)
so we can collaborate effectively.

## API

Endpoint | Body | Visibility | Summary
---------|------|---------|---
`POST /upload` | `multipart/form-data` | Public | Upload a `file`
`POST /confirmation` | `application/json` | Admin | Mark an upload as permanent
`GET /upload/:hash/:name` | none | Public | Retrieve a given upload

## Configuration

The following options are available on the config file:

Option | Type | Summary | Default
-------|------|---------|--------
`debug`| Boolean | When true, enables some minor development env tweaks. | false
`confirmTimeout` | Integer | Timeout in seconds for unconfirmed uploads to be removed. | 6
`dir` | Directory | Where to store permanent uploads. | `./uploads`
`tmpDir` | Directory | Where to store unconfirmed uploads. | `./uploads/tmp`
`sizeLimit` | Integer | A maximum byte size for uploads. | No limit
`whitelist` | Array of String | An array of mime-types/extensions that should be accepted on uploads. | Disabled
`blacklist` | Array of String | An array of mime-types/extensions that should be rejected on uploads. | Disabled
`log.file` | File | Where to stream all log events. | Unset
