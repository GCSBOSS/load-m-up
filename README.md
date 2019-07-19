# [Load m Up](https://gitlab.com/GCSBOSS/load-m-up)

A RESTful service specialized in receiving and managing web file uploads.

## Get Started

1. Install with: `npm i -g --no-optional load-m-up`.
2. Optionally point `LOADMUP_CONF` env var to a TOML [config file](#configuration).
3. Optionally store a strong admin token in `LOADMUP_TOKEN` env var.
4. Run in the terminal with: `load-m-up`.

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
`POST /upload` | `multipart/form-data` | Public | Upload files to the server
`POST /confirmation` | `application/json` | Admin | Mark an upload as permanent
`GET /upload/:hash/:name` | none | Public | Retrieve a given upload

## Configuration

The following options are available on the config file:

Option | Type | Summary | Default
-------|------|---------|--------
`debug`| Boolean | When true, enables some minor development env tweaks. | false
`port`| Boolean | HTTP port for the server to listen | 80 or 443
`confirmTimeout` | Integer | Timeout in seconds for unconfirmed uploads to be removed. | 6
`dir` | Directory | Where to store permanent uploads. | `./uploads`
`tmpDir` | Directory | Where to store unconfirmed uploads. | `./uploads/tmp`
`sizeLimit` | Integer | A maximum byte size for uploads. | No limit
`whitelist` | Array of String | An array of mime-types/extensions that should be accepted on uploads. | Disabled
`blacklist` | Array of String | An array of mime-types/extensions that should be rejected on uploads. | Disabled
`log.file` | File | Where to stream all log events. | Unset
`ssl.key` | File | Where to look for SSL key. | Unset
`ssl.cert` | File | Where to look for SSL cert/chain. | Unset
`multi` | Boolean | Whether to allow multiple files in 1 request | false
`multiSizeLimit` | Integer | A maximum overall byte size in 1 request | No Limit
`multiFileLimit` | Integer | A maximum amount of files allowed in 1 request | No Limit
