# Adding the Uttar Pradesh places data to ai-saarthi

Three files, no database, no new dependencies.

```
your-repo/
├─ data/up-places.json           ← the dataset (8 cities)
├─ app/api/places/route.js       ← GET /api/places
└─ components/PlacesExplorer.jsx ← the UI
```

## If the site is Next.js (App Router)

1. Drop the three files in at the paths above.
2. Make sure `jsconfig.json` (or `tsconfig.json`) has the `@` alias, otherwise
   change the import in `route.js` to a relative path:

```json
{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }
```

3. Render it on a page — for example `app/places/page.jsx`:

```jsx
import PlacesExplorer from "@/components/PlacesExplorer";

export const metadata = {
  title: "Places in Uttar Pradesh",
  description: "Monuments and food across Lucknow, Agra, Varanasi and more.",
};

export default function PlacesPage() {
  return <PlacesExplorer initialCity="lucknow" />;
}
```

4. `git push` to `main`. The CI workflow you added runs `npm ci`, `npm run build`
   and `npm test` on Node 18/20/22, then Vercel deploys. Visit `/places`.

## If the site is Pages Router

Move the API file to `pages/api/places.js` and change the export:

```js
import places from "../../data/up-places.json";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json({ count: places.length, places });
}
```

The component works unchanged, minus the `"use client"` line at the top.

## If the site is plain React + Vite

There is no server, so skip the API route. Import the JSON directly:

```jsx
import places from "../data/up-places.json";
```

and delete the `useEffect` fetch block, replacing it with
`const [places] = useState(placesJson)`. Everything else stays the same.

## Endpoint reference

| Request | Returns |
| --- | --- |
| `/api/places` | all 8 cities, full detail |
| `/api/places?id=agra` | one city object |
| `/api/places?region=Awadh` | Lucknow and Ayodhya |
| `/api/places?q=kachori` | cities where a kachori spot is listed |
| `/api/places?fields=summary` | names, taglines and coordinates only |

## One thing to fix before you ship

Your CI runs `npm test`. If the repo has no test script, that step fails and the
run goes red on every push. Either add to `package.json`:

```json
"scripts": { "test": "echo \"no tests yet\" && exit 0" }
```

or change the workflow step to `- run: npm test --if-present`.

## Growing the list later

The shape of each city is stable, so adding Kanpur, Gorakhpur, Bareilly,
Dudhwa or Vindhyachal is just another object in the JSON. Once the file passes
roughly 40 cities, or once someone other than you needs to edit it, move the
same fields into a Supabase table and swap the `import` in `route.js` for a
query — the component and the URL contract stay identical.
