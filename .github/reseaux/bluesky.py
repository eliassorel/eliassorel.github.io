# La tournée du soir sur Bluesky (Elias Sorel).
# Prend les N pierres suivantes de pierres.json qui ne sont pas encore dans etat_bluesky.json,
# les poste avec la carte du papier, puis met l'état à jour.
# Format : emoji + pierre / ✒️ Elias Sorel · papier / 🔗 lien
import json, os, re, sys, html, urllib.request, datetime

ICI = os.path.dirname(os.path.abspath(__file__))
PDS = "https://bsky.social/xrpc/"
N = int(os.environ.get("NOMBRE", "2"))
ESSAI = os.environ.get("ESSAI") == "1"   # 1 = on affiche sans poster


def appel(methode, corps=None, jeton=None, brut=None, type_="application/json"):
    data = brut if brut is not None else (json.dumps(corps).encode() if corps is not None else None)
    req = urllib.request.Request(PDS + methode, data=data, method="POST" if data else "GET")
    req.add_header("Content-Type", type_)
    if jeton:
        req.add_header("Authorization", "Bearer " + jeton)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def lire(url):
    req = urllib.request.Request(url, headers={"User-Agent": "EliasSorel-tournee/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def meta(page, prop):
    m = re.search(r'<meta property="og:%s" content="([^"]*)"' % prop, page)
    return html.unescape(m.group(1)) if m else ""


def graphemes(s):
    return len(s)  # approximation prudente (les emojis comptent pour 1 ou 2)


def texte_de(p):
    corps = f"{p['emoji']} {p['pierre']}\n\n✒️ Elias Sorel · {p['oeuvre']}"
    lien_affiche = p["lien"].replace("https://", "")
    complet = corps + f"\n🔗 {lien_affiche}"
    if graphemes(complet) <= 295:
        return complet, lien_affiche
    return corps, None  # trop long : la carte porte le lien


def main():
    file = json.load(open(os.path.join(ICI, "pierres.json")))["pierres"]
    etat_p = os.path.join(ICI, "etat_bluesky.json")
    etat = json.load(open(etat_p))
    faites = set(etat["postees"])
    a_poster = [p for p in file if p["n"] not in faites][:N]
    if not a_poster:
        print("File vide : toutes les pierres sont passées.")
        return
    if ESSAI:
        for p in a_poster:
            print(texte_de(p)[0], "\n---")
        return
    s = appel("com.atproto.server.createSession",
              {"identifier": os.environ["BLUESKY_HANDLE"], "password": os.environ["BLUESKY_APP_PASSWORD"]})
    jeton, did = s["accessJwt"], s["did"]
    for p in a_poster:
        texte, lien_affiche = texte_de(p)
        facets = []
        if lien_affiche:
            b = texte.encode("utf-8")
            debut = b.index(lien_affiche.encode("utf-8"))
            facets.append({"index": {"byteStart": debut, "byteEnd": debut + len(lien_affiche.encode("utf-8"))},
                           "features": [{"$type": "app.bsky.richtext.facet#link", "uri": p["lien"]}]})
        page = lire(p["lien"]).decode("utf-8", "replace")
        externe = {"uri": p["lien"], "title": meta(page, "title"), "description": meta(page, "description")}
        img = meta(page, "image")
        if img:
            blob = appel("com.atproto.repo.uploadBlob", brut=lire(img), jeton=jeton, type_="image/jpeg")["blob"]
            externe["thumb"] = blob
        record = {"$type": "app.bsky.feed.post", "text": texte, "langs": ["fr"],
                  "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
                  "embed": {"$type": "app.bsky.embed.external", "external": externe}}
        if facets:
            record["facets"] = facets
        r = appel("com.atproto.repo.createRecord", {"repo": did, "collection": "app.bsky.feed.post", "record": record}, jeton=jeton)
        print("posté", p["n"], p["oeuvre"], r.get("uri"))
        etat["postees"].append(p["n"])
        json.dump(etat, open(etat_p, "w"), indent=1)


if __name__ == "__main__":
    main()
