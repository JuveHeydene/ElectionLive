"use client"


import React from "react";
import Image from "next/image";

const ElectionHomePage = () => {
  const keyDates = [
    { title: "Registration Deadline", date: "March 15, 2025" },
    { title: "Election Day", date: "June 25, 2025" },
    { title: "Results Announcement", date: "July 5, 2025" },
  ];

  const candidates = [
    { name: "PAUL BIYA", party: "RDPC", photo: "/HumanImages/candidat1.jpg" },
    { name: "SELENA JANE", party: "DMPC", photo: "/HumanImages/candidta2.jpg" },
    { name: "ATANGANA PIERRE", party: "PJHL", photo: "/HumanImages/candidat3.jpg" },
  ];

  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold">ELECAM Election 2025</h1>
        <nav className="space-x-4">
          <a href="#home" className="hover:underline">Home</a>
          <a href="#about" className="hover:underline">About</a>
          <a href="#candidates" className="hover:underline">Candidates</a>
          <a href="#guide" className="hover:underline">Voting Guide</a>
          <button onClick={() => handleScroll("candidates")} className="hover:underline">Candidates</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-900 text-white text-center py-20">
        <h2 className="text-4xl font-bold mb-4">Election 2025: Your Voice, Your Power</h2>
        <p className="mb-6">Join us in shaping the future of Cameroon</p>
        <button className="bg-yellow-500 text-blue-900 px-6 py-2 rounded-md hover:bg-yellow-600">
          Learn More
        </button>
      </section>

      {/* Key Dates Section */}
      <section className="p-8 bg-white">
        <h3 className="text-2xl font-bold mb-4 text-center">Key Dates & Events</h3>
        <div className="flex justify-center gap-8">
          {keyDates.map((date, index) => (
            <div key={index} className="bg-gray-200 p-4 rounded-lg shadow-md text-center">
              <h4 className="font-bold text-lg">{date.title}</h4>
              <p className="text-gray-700">{date.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Candidates Section */}
      <section id="candidates" className="p-8">
        <h3 className="text-2xl font-bold mb-4 text-center">Meet Your Candidates</h3>
        <div className="flex gap-6 justify-center">
          {candidates.map((candidate, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-lg">
              <Image
                src={candidate.photo}
                alt={candidate.name}
                width={100}
                height={100}
                className="rounded-full mx-auto"
              />
              <h4 className="text-lg font-bold text-center mt-2">{candidate.name}</h4>
              <p className="text-gray-500 text-center">{candidate.party}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>© 2025 ELECAM Cameroon. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ElectionHomePage;
