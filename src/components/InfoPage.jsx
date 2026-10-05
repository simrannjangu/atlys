import { Link, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const pages = {
  contact: {
    category: "CONTACT",
    title: "Get in touch",
    subtitle:
      "Have a question about VisaGo? We're here to help.",
    sections: [
      {
        title: "Customer Support",
        text:
          "Get help with your visa application, documents, payments or application status."
      },
      {
        title: "General enquiries",
        text:
          "For general questions about VisaGo and our services, reach out to our support team."
      },
      {
        title: "Application support",
        text:
          "If you're already applying for a visa, include your application details so our team can assist you faster."
      }
    ]
  },

  careers: {
    category: "CAREERS",
    title: "Build the future of travel",
    subtitle:
      "We're building technology that makes international travel simpler.",
    sections: [
      {
        title: "Work with us",
        text:
          "Join a team working on digital visa applications, travel technology and customer experiences."
      },
      {
        title: "Engineering",
        text:
          "Build products used by travellers around the world."
      },
      {
        title: "Open roles",
        text:
          "Explore opportunities across engineering, product, operations, growth and customer experience."
      }
    ]
  },

  newsroom: {
    category: "NEWSROOM",
    title: "VisaGo Newsroom",
    subtitle:
      "Company announcements, product updates and travel industry stories.",
    sections: [
      {
        title: "Company updates",
        text:
          "Read the latest VisaGo announcements and product developments."
      },
      {
        title: "Travel technology",
        text:
          "Explore stories about technology changing the visa and travel experience."
      },
      {
        title: "Media enquiries",
        text:
          "For press and media enquiries, contact our communications team."
      }
    ]
  },

  defence: {
    category: "DEFENCE",
    title: "Defence personnel",
    subtitle:
      "Visa information and travel support for defence personnel.",
    sections: [
      {
        title: "Travel support",
        text:
          "Access visa information designed around official and professional travel requirements."
      },
      {
        title: "Documentation",
        text:
          "Review destination-specific requirements before beginning an application."
      }
    ]
  },

  partners: {
    category: "PARTNERS",
    title: "Partner with VisaGo",
    subtitle:
      "Build better travel experiences together.",
    sections: [
      {
        title: "Partnerships",
        text:
          "Work with VisaGo to make international travel easier for your customers."
      },
      {
        title: "Business enquiries",
        text:
          "Tell us about your business and how you'd like to work together."
      }
    ]
  },

  security: {
    category: "SECURITY",
    title: "Security at VisaGo",
    subtitle:
      "Your information deserves careful protection.",
    sections: [
      {
        title: "Data protection",
        text:
          "We design our platform with security and responsible data handling in mind."
      },
      {
        title: "Responsible disclosure",
        text:
          "Security researchers can report potential vulnerabilities through our security channel."
      }
    ]
  },

  transparency: {
    category: "TRANSPARENCY",
    title: "Transparency",
    subtitle:
      "Clear information about how VisaGo operates.",
    sections: [
      {
        title: "Clear pricing",
        text:
          "We aim to show applicable costs clearly before an application begins."
      },
      {
        title: "Application information",
        text:
          "Visa requirements and processing conditions can change, so always verify current official requirements."
      }
    ]
  },

  "refunds-policy": {
    category: "TRUST",
    title: "Refunds Policy",
    subtitle:
      "Understand how refunds work at VisaGo.",
    sections: [
      {
        title: "Before applying",
        text:
          "Review the applicable refund conditions before submitting an application."
      },
      {
        title: "Application refunds",
        text:
          "Refund eligibility depends on the specific service and circumstances."
      }
    ]
  },

  "fee-change-audit": {
    category: "TRUST",
    title: "Fee Change Audit",
    subtitle:
      "Understand how VisaGo monitors pricing information.",
    sections: [
      {
        title: "Transparent pricing",
        text:
          "We aim to present applicable government and service fees clearly."
      }
    ]
  },

  status: {
    category: "STATUS",
    title: "VisaGo system status",
    subtitle:
      "Check the availability of VisaGo services.",
    sections: [
      {
        title: "All systems operational",
        text:
          "Visa applications, destination information and account services are currently available."
      }
    ]
  },

  engineering: {
    category: "ENGINEERING",
    title: "Engineering at VisaGo",
    subtitle:
      "Technology powering a simpler visa experience.",
    sections: [
      {
        title: "Build with us",
        text:
          "Our engineering teams work across frontend, backend, infrastructure and product systems."
      }
    ]
  },

  faultlines: {
    category: "FAULTLINES",
    title: "VisaGo Faultlines",
    subtitle:
      "A closer look at problems in the travel and visa experience.",
    sections: [
      {
        title: "Research",
        text:
          "Explore observations and ideas around improving international travel."
      }
    ]
  },

  "visa-requirements": {
    category: "TOOLS",
    title: "Visa Requirements Checker",
    subtitle:
      "Find the visa information you need for your destination.",
    sections: [
      {
        title: "Choose your destination",
        text:
          "Select a destination to explore visa type, documents and application information."
      }
    ]
  },

  "visa-photo-creator": {
    category: "TOOLS",
    title: "Visa Photo Creator",
    subtitle:
      "Create a visa-ready photograph online.",
    sections: [
      {
        title: "Create your photo",
        text:
          "Upload a photograph and prepare it according to the applicable visa photo requirements."
      }
    ]
  },

  "emergency-helpline": {
    category: "TOOLS",
    title: "VisaGo Emergency Helpline",
    subtitle:
      "Get help when your travel plans need urgent attention.",
    sections: [
      {
        title: "Travel assistance",
        text:
          "Connect with support for urgent visa and travel-related questions."
      }
    ]
  },

  "rejection-recovery": {
    category: "TOOLS",
    title: "Rejection Recovery",
    subtitle:
      "Understand what to do after a visa rejection.",
    sections: [
      {
        title: "Review your application",
        text:
          "Understand the reason for rejection and identify what may need to change."
      }
    ]
  },

  "passport-index": {
    category: "TOOLS",
    title: "Passport Index",
    subtitle:
      "Explore travel access around the world.",
    sections: [
      {
        title: "Passport information",
        text:
          "Explore destination access and visa requirements by passport."
      }
    ]
  },

  magazine: {
    category: "MAGAZINE",
    title: "VisaGo Magazine",
    subtitle:
      "Travel guides, visa information and destination stories.",
    sections: [
      {
        title: "Travel guides",
        text:
          "Discover practical information for planning international trips."
      }
    ]
  },

  privacy: {
    category: "LEGAL",
    title: "Privacy Policy",
    subtitle:
      "How VisaGo handles information on the platform.",
    sections: [
      {
        title: "Your information",
        text:
          "This page explains how information may be collected, used and protected."
      }
    ]
  },

  terms: {
    category: "LEGAL",
    title: "Terms of Service",
    subtitle:
      "The terms governing use of VisaGo.",
    sections: [
      {
        title: "Using VisaGo",
        text:
          "Please review these terms before using the platform."
      }
    ]
  }
};

function InfoPage() {
  const { page } = useParams();

  const data = pages[page];

  if (!data) {
    return (
      <>
        <Navbar />

        <main className="info-page">
          <div className="info-page-inner">
            <p className="eyebrow">404</p>
            <h1>Page not found</h1>
            <Link to="/">Back to VisaGo</Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="info-page">

        <section className="info-hero">
          <div className="info-page-inner">

            <p className="eyebrow">
              {data.category}
            </p>

            <h1>{data.title}</h1>

            <p className="info-subtitle">
              {data.subtitle}
            </p>

          </div>
        </section>


        <section className="info-content">

          <div className="info-page-inner">

            {data.sections.map((section) => (
              <article
                className="info-block"
                key={section.title}
              >
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </article>
            ))}

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default InfoPage;