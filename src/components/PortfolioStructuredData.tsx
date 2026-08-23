import {
  capabilityGroups,
  portfolioProfile,
  portfolioProjects,
  socialLinks,
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
      knowsAbout: capabilityGroups.flatMap((group) => group.items.map((item) => item.name)),
    },
    ...portfolioProjects.map((project) => ({
      "@type": "CreativeWork",
      "@id": `${siteOrigin}/#project-${project.id}`,
      name: project.title,
      description: project.summary,
      url: project.links[0]?.href ?? `${siteOrigin}/#project-${project.id}`,
      creator: { "@id": personId },
      genre: project.kind,
      keywords: project.technologies.join(", "),
      image: `${siteOrigin}${project.image}`,
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
