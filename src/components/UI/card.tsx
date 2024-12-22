import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 border-b ${className}`}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

export const CardDescription: React.FC<CardProps> = ({ children, className = '' }) => (
  <p className={`mt-1 text-sm text-gray-600 ${className}`}>{children}</p>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 border-t ${className}`}>{children}</div>
); 