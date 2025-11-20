"use client";

export default function CopyLinkButton() {
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // no-op
    }
  };
  return (
    <button
      onClick={onClick}
      className="ml-auto text-xs px-2 py-1 border rounded hover:bg-gray-50"
    >
      Copy link
    </button>
  );
}
