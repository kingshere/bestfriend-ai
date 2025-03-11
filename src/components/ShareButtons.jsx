import React from "react";
import { FaTwitter, FaFacebook, FaLinkedin, FaCopy } from "react-icons/fa";

function ShareButtons({ answer }) {
  const shareText = `Check out this AI response: ${answer.substring(0, 100)}...`;
  const encodedText = encodeURIComponent(shareText);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(answer);
    alert("Answer copied to clipboard!");
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
