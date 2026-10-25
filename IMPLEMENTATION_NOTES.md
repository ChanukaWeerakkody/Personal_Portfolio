# Portfolio v2 – Update Notes

## Implemented
- Stable navbar scroll-spy using IntersectionObserver + requestAnimationFrame scroll-position fallback.
- Persistent accent colour switcher with Indigo, Emerald, Violet, Rose and Amber presets.
- Accent picker exposed directly in the desktop navbar and retained in the Ctrl/Cmd+K palette.
- Projects section restricted to personal/open-source work; NDA/client product names removed from public timeline content.
- Six requested projects retained with GitHub profile search links where an exact slug could not be independently verified; Next Travel uses the verified public repository `ChanukaWeerakkody/Next_Travel_Web_Application`.
- GitHub section uses the public GitHub REST API for live profile/repository metrics and contribution data, plus an optional github-readme-stats card.
- Added a clearly labelled mocked Bitbucket activity panel for private/restricted workspaces; it does not claim to be live Bitbucket data.
- Writing section metadata refreshed around Elixir/BEAM concurrency, Kafka/event streaming, AES-256-CBC payload security and Nginx security hardening.
- CV copied to `public/Chanuka_Weerakkody_CV.pdf` for the existing download flow.
- Theme preference persistence now restores both theme and accent on reload.

## Verification
The source tree was statically inspected after patching. A full `npm run build` could not be executed in this environment because dependency installation requires network access and the provided runtime did not have a complete Vite dependency tree.
