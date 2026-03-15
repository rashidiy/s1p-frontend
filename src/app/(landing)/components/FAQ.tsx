'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Collapse } from 'antd';

const FAQ_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const;

function ChevronIcon({ isActive }: { isActive?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 ${
        isActive ? 'rotate-180' : 'rotate-0'
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function FAQ() {
  const t = useTranslations('landing');
  const prefersReducedMotion = useReducedMotion();

  const sectionVariants: Variants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 32 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      };

  const items = FAQ_KEYS.map((num) => ({
    key: num,
    label: (
      <span className="text-base font-medium text-gray-900">
        {t(`faq.q${num}`)}
      </span>
    ),
    children: (
      <p className="text-base leading-relaxed text-gray-600">
        {t(`faq.a${num}`)}
      </p>
    ),
  }));

  return (
    <section id="faq" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Section heading */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('faq.title')}
          </h2>
        </div>

        {/* FAQ accordion */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <Collapse
            accordion
            bordered={false}
            expandIcon={({ isActive }) => <ChevronIcon isActive={isActive} />}
            expandIconPosition="end"
            items={items}
            style={{ background: 'transparent' }}
            className="faq-collapse"
          />
        </motion.div>
      </div>

      {/* Custom styles to override Ant Design defaults */}
      <style jsx global>{`
        .faq-collapse .ant-collapse-item {
          border: 1px solid #f3f4f6 !important;
          border-radius: 16px !important;
          margin-bottom: 12px !important;
          background: #ffffff !important;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .faq-collapse .ant-collapse-item:hover {
          border-color: #e5e7eb !important;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04);
        }
        .faq-collapse .ant-collapse-item-active {
          border-color: #e0e7ff !important;
          box-shadow: 0 1px 3px 0 rgb(99 102 241 / 0.06);
        }
        .faq-collapse .ant-collapse-header {
          padding: 20px 24px !important;
          align-items: center !important;
        }
        .faq-collapse .ant-collapse-content {
          border-top: 1px solid #f3f4f6 !important;
        }
        .faq-collapse .ant-collapse-content-box {
          padding: 16px 24px 20px !important;
        }
        .faq-collapse .ant-collapse-item:last-child {
          margin-bottom: 0 !important;
        }
      `}</style>
    </section>
  );
}
