# Phase 01 GitHub Source Transfer Status

**RECOVERED SOURCE ZIP IS NOT YET INCLUDED IN THIS PR** unless the Windows helper has subsequently run and a successful commit is visible.

The complete archive lives in the project conversation:
`DEVFOLIO_OS_Phase_01_Complete_Requirements_Engineering.zip`
- **82,281 bytes**
- SHA-256 **`5f6030d6f2c7a6e6b3b8dd56be86216c84ebdd969dbece75a92b829c158adefd`**
- ZIP integrity: PASS
- 25 packaged members, including both intact historical source ZIPs.

The connected GitHub tool uploads UTF-8 text, not bytes from the local sandbox ZIP. For exact original docs, use the checked-in `tools/upload-phase01-source.ps1` helper. It verifies the ZIP before extracting it and pushes original draft texts, traceability CSVs and both original ZIP packages (all are small enough for ordinary Git) to **this same PR branch**, never `main` directly.

Verify final PR paths exist and original archives match the supplied hashes before marking source transfer complete. **Owner-approved SRS remains a separate gate even after source upload.**
