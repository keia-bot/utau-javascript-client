# utau javascript client

a javascript client for our internal lyrics service known as utau.

## usage

```typescript
import { fetchLyrics, extract } from "@keia/utau-client";

const lyrics = await fetchLyrics("powfu flashlights in the forest", {
  types: ["raw"],
  apiKey: "your api key",
  userAgent: "My Application (contact@example.com)",
});

const raw = extract(lyrics, "raw");
console.log(raw.text); // Swallowed by sounds in the night...
```

> [!IMPORTANT]  
> currently, api keys are not being handed out, if you want to use our api, please join our [Discord Server](https://keia.one/discord).

---

[keia bot](https://keia.one) &copy; 2023
