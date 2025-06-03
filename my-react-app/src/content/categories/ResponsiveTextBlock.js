import React from 'react';
import classes from './categories.module.css'; 

const ResponsiveTextBlock = () => {
  return (
    <div className={classes.container}>
      <div className={classes.title}>
        Understanding E-Procurement
      </div>
      <div className={classes.sectionTitle}>
        What is E-Procurement?
      </div>
      <p className={classes.text}>
        E-procurement is the electronic process of purchasing goods and services. It streamlines the procurement lifecycle, from identifying needs and sourcing suppliers to placing orders and managing payments. Utilizing digital platforms enhances efficiency and transparency.
      </p>
      <div className={classes.sectionTitle}>
        Key Benefits
      </div>
      <p className={classes.text}>
        Implementing an e-procurement system offers numerous benefits. These include increased transparency through public access to tender information, reduced administrative costs, faster transaction cycles, and improved record-keeping. It also fosters fair competition among suppliers.
      </p>
      <div className={classes.sectionTitle}>
        Roles in the System
      </div>
      <p className={classes.text}>
        The system involves several key participants: Customers who initiate procurement needs, Suppliers who submit offers, and the Public who monitor the process for transparency and accountability. Each role is crucial for the system's integrity and success.
      </p>
    </div>
  );
};

export default ResponsiveTextBlock;