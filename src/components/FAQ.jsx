import { useState } from "react";

function FAQ() {

  const [open, setOpen] = useState(null);

  const questions = [
    {
      question: "What is VisaGo?",
      answer:
        "VisaGo is a visa information and application platform designed to make the visa journey easier to understand and manage."
    },

    {
      question: "How do I find the visa requirements for a country?",
      answer:
        "Choose a destination from the Explore section to view the available visa information, document requirements and application steps."
    },

    {
      question: "Can I apply for a visa online?",
      answer:
        "Visa availability and application methods depend on the destination and visa type. VisaGo can guide you through the relevant application information."
    },

    {
      question: "How long does a visa application take?",
      answer:
        "Processing times vary by destination, visa type, nationality and other circumstances. Always check the applicable official immigration information before travelling."
    },

    {
      question: "What documents do I need?",
      answer:
        "Required documents depend on the destination and visa type. Check the destination page for the relevant document information."
    }

  ];


  return (
    <section className="faq-home-section" id="faq">

      <div className="faq-home-container">

        <div className="faq-home-heading">

          <p className="eyebrow">
            FAQ
          </p>

          <h2>
            Frequently asked
            <br />
            questions.
          </h2>

        </div>


        <div className="faq-home-list">

          {questions.map((item, index) => (

            <div
              className="faq-home-item"
              key={item.question}
            >

              <button
                onClick={() =>
                  setOpen(
                    open === index
                      ? null
                      : index
                  )
                }
                className="faq-home-question"
              >

                <span>
                  {item.question}
                </span>

                <span className="faq-home-plus">
                  {open === index ? "−" : "+"}
                </span>

              </button>


              {open === index && (

                <div className="faq-home-answer">

                  <p>
                    {item.answer}
                  </p>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default FAQ;