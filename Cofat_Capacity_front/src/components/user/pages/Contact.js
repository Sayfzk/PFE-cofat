import React from 'react';
import './style/Contact.css'; // Importation du style CSS

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Please fill out the form below to get in touch.</p>
      </div>
      
      <div className="contact-container">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>
            Feel free to reach out to us for any inquiries, support, or collaboration opportunities.
          </p>
          <div className="contact-icons">
            <div>
              <i className="fas fa-phone"></i>
              <span>+21693216675</span>
            </div>
            <div>
              <i className="fas fa-envelope"></i>
              <span>
                <a href="mailto:Admin@Cofat.com">Admin@Cofat.com</a>
              </span>
            </div>
            <div>
              <i className="fas fa-map-marker-alt"></i>
              <span>Avenue de l'U.M.A, Tunis 2035, Tunisia</span>
            </div>
          </div>
        </div>
        
        <form className="contact-form">
          <div className="form-group">
            <input type="text" placeholder="Your Name" required />
          </div>
          <div className="form-group">
            <input type="email" placeholder="Your Email" required />
          </div>
          <div className="form-group">
            <textarea rows="5" placeholder="Your Message" required></textarea>
          </div>
          <button type="submit" className="contact-btn">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;