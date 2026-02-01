import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_xoshamr';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_a60mqid';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'XmtPk8I0OJdOV7HJB';

export default function Contact() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsSubmitting(true);

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current
      );
      toast.success('Message sent! I will get back to you soon.');
      formRef.current.reset();
    } catch (error) {
      console.error('EmailJS error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/50"
    >
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          Get In Touch
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-400 text-center mb-10"
        >
          Have a project in mind or want to chat? Feel free to reach out!
        </motion.p>

        <motion.form
          ref={formRef}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="user_name" className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="user_name"
              name="user_name"
              required
              className="input-field"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="user_email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="user_email"
              name="user_email"
              required
              className="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="input-field resize-none"
              placeholder="Your message..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
