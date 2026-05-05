export default function robots() {
    return {
        rules: [
            {
                userAgent: "facebookexternalhit",
                allow: "/",
            },
            {
                userAgent: "*",
                allow: "/",
            },
        ],
    }
}