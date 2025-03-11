import React from "react";
import { FaTwitter, FaFacebook, FaLinkedin, FaCopy } from "react-icons/fa";

function ShareButtons({ answer }) {
  // Add a check to ensure answer is a valid string
  const validAnswer = answer && typeof answer === 'string' ? answer : '';
  const shareText = `Check out this AI response: ${validAnswer.substring(0, 100)}...`;
  const encodedText = encodeURIComponent(shareText);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(validAnswer)
      .then(() => {
        alert("Answer copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert("Failed to copy to clipboard. Please try again.");
      });
  };

  return (
    <div className="flex justify-center space-x-4 mt-4">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
      >
        <FaTwitter size={24} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
      >
        <FaFacebook size={24} />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=AI%20Response&summary=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
      >
        <FaLinkedin size={24} />
      </a>
      <button
        onClick={copyToClipboard}
        className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
      >
        <FaCopy size={24} />
      </button>
    </div>
  );
}

export default ShareButtons;
