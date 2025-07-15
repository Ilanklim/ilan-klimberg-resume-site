import { useEffect } from 'react';

export function SEOStructuredData() {
  useEffect(() => {
    // Add website structured data
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Ilan Klimberg Portfolio",
      "url": "https://yourdomain.com",
      "description": "Professional portfolio of Ilan Klimberg - Cornell CS student, blockchain entrepreneur, and incoming Coinbase APM intern.",
      "author": {
        "@type": "Person",
        "name": "Ilan Klimberg"
      },
      "mainEntity": {
        "@type": "Person",
        "@id": "https://yourdomain.com/#person"
      }
    };

    // Add professional profile structured data
    const profileSchema = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "@id": "https://yourdomain.com/#person",
        "name": "Ilan Klimberg",
        "alternateName": "Ilan Klim",
        "description": "Cornell Computer Science student, blockchain entrepreneur, and incoming Coinbase APM intern with expertise in full-stack development and fintech.",
        "url": "https://yourdomain.com",
        "image": "https://yourdomain.com/lovable-uploads/69da4a92-5c6e-4971-89ae-9185a82ad37f.png",
        "sameAs": [
          "https://linkedin.com/in/ilan-klimberg",
          "https://github.com/ilan-klim",
          "https://twitter.com/ilan_klim"
        ],
        "jobTitle": "Computer Science Student & Blockchain Entrepreneur",
        "worksFor": [
          {
            "@type": "Organization",
            "name": "Cornell University",
            "url": "https://cornell.edu"
          },
          {
            "@type": "Organization",
            "name": "Coinbase",
            "url": "https://coinbase.com"
          }
        ],
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Cornell University",
          "url": "https://cornell.edu"
        },
        "knowsAbout": [
          "Computer Science",
          "Blockchain Technology",
          "Full Stack Development",
          "React",
          "Python",
          "Solidity",
          "Software Engineering",
          "Product Management",
          "Fintech"
        ],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Software Engineer",
          "occupationLocation": {
            "@type": "Place",
            "name": "United States"
          },
          "skills": "React, Python, Solidity, Blockchain, Full Stack Development"
        }
      }
    };

    // Add organization schema for founded companies
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "KBCrypto",
      "founder": {
        "@type": "Person",
        "name": "Ilan Klimberg",
        "@id": "https://yourdomain.com/#person"
      },
      "description": "Blockchain and cryptocurrency focused company founded by Ilan Klimberg"
    };

    // Insert schemas into head
    const insertSchema = (schema: object, id: string) => {
      let script = document.getElementById(id) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    };

    insertSchema(websiteSchema, 'website-schema');
    insertSchema(profileSchema, 'profile-schema');
    insertSchema(organizationSchema, 'organization-schema');

    return () => {
      // Cleanup on unmount
      ['website-schema', 'profile-schema', 'organization-schema'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.remove();
        }
      });
    };
  }, []);

  return null;
}