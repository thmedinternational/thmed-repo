import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
      <div className="container mx-auto text-center text-sm">
        <p>
          All rights reserved to{' '}
          <a
            href="https://www.camsnett.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-primary"
          >
            www.camsnett.com
          </a>{' '}
          the designing company.
        </p>
      </div>
    </footer>
  );
};

export default Footer;