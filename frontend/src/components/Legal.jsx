import React from "react";
import Footer from "./Footer";


const sections = [
  { id: "terms", title: "Terms of Service" },
  { id: "privacy", title: "Privacy Policy" },
  { id: "cookie", title: "Cookie Policy" },
  { id: "rental", title: "Rental Agreement" },
];

// ⬇️ YOU NEED THIS PART
const sectionContents = {
  terms: (
    <>
      <p>Welcome to RentEasy! By using our platform, you agree to follow these Terms of Service:</p>
      <ul className="list-disc list-inside space-y-2 pl-5 marker:text-[#0c4a6e]">
        <li><strong>Eligibility:</strong> You must be at least 18 years old to use our services.</li>
        <li><strong>Account Responsibility:</strong> You are responsible for your account and password.</li>
        <li><strong>Prohibited Activities:</strong> You agree not to misuse the site for fraudulent activities.</li>
        <li><strong>Changes to Service:</strong> We can modify or discontinue services anytime without notice.</li>
        <li><strong>Liability Limitation:</strong> We are not responsible for any damages from using RentEasy.</li>
      </ul>
    </>
  ),
  privacy: (
    <>
      <p>We are committed to protecting your personal information:</p>
      <ul className="list-disc list-inside space-y-2 pl-5 marker:text-[#0c4a6e]">
        <li><strong>Information Collection:</strong> We collect your name, email, and contact details.</li>
        <li><strong>Usage:</strong> Your info helps us personalize your experience and improve services.</li>
        <li><strong>Data Sharing:</strong> We don’t sell your data except to essential service providers.</li>
        <li><strong>Security:</strong> We use encryption to protect your data.</li>
        <li><strong>Your Choices:</strong> You can request access, correction, or deletion of your data anytime.</li>
      </ul>
    </>
  ),
  cookie: (
    <>
      <p>Cookies help us deliver a better user experience:</p>
      <ul className="list-disc list-inside space-y-2 pl-5 marker:text-[#0c4a6e]">
        <li><strong>What are Cookies?</strong> Small data files to recognize you on our platform.</li>
        <li><strong>Types:</strong> Essential, performance, and targeting cookies.</li>
        <li><strong>Purpose:</strong> To remember preferences, improve performance, personalize marketing.</li>
        <li><strong>Managing Cookies:</strong> You can manage or disable cookies in your browser settings.</li>
      </ul>
    </>
  ),
  rental: (
    <>
      <p>When you book through RentEasy, you agree to:</p>
      <ul className="list-disc list-inside space-y-2 pl-5 marker:text-[#0c4a6e]">
        <li><strong>Booking Confirmation:</strong> Confirmed after payment and approval.</li>
        <li><strong>Cancellations & Refunds:</strong> Varies by property; check specific terms.</li>
        <li><strong>Tenant Responsibilities:</strong> Maintain the rented property well.</li>
        <li><strong>Owner Responsibilities:</strong> Owners must ensure safety and accurate descriptions.</li>
        <li><strong>Dispute Resolution:</strong> Report disputes to RentEasy support for mediation.</li>
      </ul>
    </>
  ),
};

// const [activeSection, setActiveSection] = React.useState(null);


const Legal = () => {

    const [activeSection, setActiveSection] = React.useState(null);
  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Hero Section */}
      {/* Sticky Header + Navigation */}
<div className="sticky top-15 z-20 bg-white shadow-sm">
  {/* Hero Section */}
  <section className="bg-[#f8fafc] py-8">
    <div className="container mx-auto px-4">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0c4a6e] mb-2">
          Legal & Policies
        </h1>
        <p className="text-[#64748b] text-base md:text-lg max-w-2xl mx-auto">
          Everything you need to know about our terms, privacy policy, and rental agreements.
        </p>
      </div>
    </div>
  </section>

  {/* Navigation Pills */}
  <nav className="bg-white">
    <div className="max-w-4xl mx-auto px-4 py-3">
      <div className="flex flex-wrap gap-3 justify-center">
        {sections.map((section) => (
          <a
          key={section.id}
          href={`#${section.id}`}
          onClick={() => setActiveSection(section.id)}
          className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
            activeSection === section.id
              ? "bg-blue-600 text-white" // Dark background when active
              : "text-[#0c4a6e] hover:bg-[#e0f2fe]"
          }`}
        >
            {section.title}
          </a>
        ))}
      </div>
    </div>
  </nav>
</div>


      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4 py-25">
        <div className="space-y-20">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-85 bg-[#f0f9ff] p-8 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6">
               {section.title}
               </h2>
              <div className="prose prose-lg max-w-none text-[#475569] space-y-6">
                {sectionContents[section.id]}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div> 
  );
};

export default Legal;
