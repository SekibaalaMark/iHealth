import React, { useState } from 'react';

const ContactSupport = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Support message sent!");
  };

  return (
    <section className="p-6 bg-white shadow-md rounded-lg hover:shadow-2xl transition-all duration-500">
      <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded" />
        <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
        <textarea placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} required className="w-full p-2 border rounded"></textarea>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send</button>
      </form>
    </section>
  );
};

export default ContactSupport;
