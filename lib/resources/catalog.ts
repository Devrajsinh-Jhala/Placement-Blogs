// lib/resources/catalog.ts
export type Topic = "CN" | "OS" | "DBMS" | "DSA";
export type Resource = {
    topic: Topic;
    title: string;
    url: string;
    type: "youtube" | "sheet" | "article";
    author?: string;
};

/**
 * Curated, stable links. Keep this small & high-signal.
 * For YouTube, we use channel/playlist searches to avoid brittle playlist IDs.
 * You can replace any of these with exact playlist URLs later if you prefer.
 */
export const RESOURCE_CATALOG: Resource[] = [
    // CN
    {
        topic: "CN",
        title: "Gate Smashers – Computer Networks (Playlist)",
        url: "https://www.youtube.com/results?search_query=Gate+Smashers+Computer+Networks+playlist",
        type: "youtube",
        author: "Gate Smashers",
    },
    {
        topic: "CN",
        title: "Love Babbar – Computer Networks (Playlist)",
        url: "https://www.youtube.com/results?search_query=Love+Babbar+Computer+Networks+playlist",
        type: "youtube",
        author: "CodeHelp by Babbar",
    },

    // OS
    {
        topic: "OS",
        title: "Gate Smashers – Operating Systems (Playlist)",
        url: "https://www.youtube.com/results?search_query=Gate+Smashers+Operating+System+playlist",
        type: "youtube",
        author: "Gate Smashers",
    },
    {
        topic: "OS",
        title: "Love Babbar – Operating Systems (Playlist)",
        url: "https://www.youtube.com/results?search_query=Love+Babbar+Operating+Systems+playlist",
        type: "youtube",
        author: "CodeHelp by Babbar",
    },

    // DBMS
    {
        topic: "DBMS",
        title: "Love Babbar – DBMS (Playlist)",
        url: "https://www.youtube.com/results?search_query=Love+Babbar+DBMS+playlist",
        type: "youtube",
        author: "CodeHelp by Babbar",
    },
    {
        topic: "DBMS",
        title: "Gate Smashers – DBMS (Playlist)",
        url: "https://www.youtube.com/results?search_query=Gate+Smashers+DBMS+playlist",
        type: "youtube",
        author: "Gate Smashers",
    },

    // DSA
    {
        topic: "DSA",
        title: "Striver – A2Z DSA Course (Playlist)",
        url: "https://www.youtube.com/results?search_query=takeUforward+A2Z+DSA+playlist",
        type: "youtube",
        author: "takeUforward",
    },
    {
        topic: "DSA",
        title: "Striver – SDE Sheet (Website)",
        url: "https://takeuforward.org/",
        type: "sheet",
        author: "takeUforward",
    },
];
