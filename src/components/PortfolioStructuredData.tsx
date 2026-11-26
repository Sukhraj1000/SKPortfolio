import {
  capabilityGroups,
  portfolioProfile,
  selectedWork,
  socialLinks,
  universityWork,
} from "@/data/portfolio";
import { siteOrigin } from "@/lib/site";

const personId = `${siteOrigin}/#person`;
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: portfolioProfile.name,
      url: `${siteOrigin}/`,
      image: `${siteOrigin}/sk-icon.png`,
      jobTitle: portfolioProfile.role,
      description: portfolioProfile.positioning,
      address: {
        "@type": "PostalAddress",
        addressRegion: "West Midlands",
        addressCountry: "GB",
      },
      sameAs: socialLinks.map((social) => social.href),
      knowsAbout: capabilityGroups.flatMap<string>((group) => group.items),
    },
    ...[...selectedWork, ...universityWork].map((project) => ({
      "@type": "CreativeWork",
      "@id": `${siteOrigin}/#project-${project.id}`,
      name: project.title,
      url: project.href,
      creator: { "@id": personId },
      ...("caption" in project ? { description: project.caption } : {}),
    })),
  ],
};

export function PortfolioStructuredData() {
  return (
    <script
      id="portfolio-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
      }}
    />
  );
}
