// this could be done inside of the rust code, but that would require rewritting
// the pkarr publisher/resolver, or just having the upstream crate make reqwest
// not cache the request, but that requires submitting a pr to iroh
const original = unsafeWindow.fetch;
unsafeWindow.fetch = function (url, options) {
    let endpoint: string;
    if (url instanceof Request)
        endpoint = url.url;
    else endpoint = url.toString();

    if (endpoint.includes("relay.pkarr.org")) {
        if (url instanceof Request) {
            url = new Request(url, { cache: "no-store" });
        } else {
            options ||= {};
            options.cache = "no-store";
        }
    }

    return original.call(this, url, options);
}
