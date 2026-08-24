const icons = {
  courses: 'M4 19V5a1 1 0 0 1 1-1h6v16H5a1 1 0 0 1-1-1Zm10-1V4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-5Z',
  assignments: 'M8 3h8v3H8V3Zm-3 4h14v14H5V7Zm4 4h6M9 15h4',
  attendance: 'M8 2v3M16 2v3M4 8h16M5 5h14v16H5V5Zm4 7 2.5 2.5L16 10',
  exams: 'M14 3H6v18h12V8l-4-5Zm0 0v5h5M8 13h8M8 17h5',
  results: 'M12 3 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Zm-3 9 2.5 2.5L16 9',
  bell: 'M12 4a6 6 0 0 1 6 6v4l1.5 2.5H4.5L6 14v-4a6 6 0 0 1 6-6Zm-2 14a2 2 0 0 0 4 0',
  mail: 'M4 6h16v12H4V6Zm0 0 8 7 8-7',
  lock: 'M8 11V8a4 4 0 0 1 8 0v3M6 11h12v10H6V11Zm6 4v3',
  graduate: 'M2 10 12 5l10 5-10 5L2 10Zm4 3v4c2 2 12 2 12 0v-4',
  teach: 'M4 19V6l8-3 8 3v13M4 19l8-3 8 3M12 8v8',
  shield: 'M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z',
  spark: 'M12 3v4M12 17v4M4.9 6.9l2.8 2.8M16.3 14.3l2.8 2.8M3 12h4M17 12h4M4.9 17.1l2.8-2.8M16.3 9.7l2.8-2.8',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm11 9v-1a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v1M17 11a3 3 0 1 0 0-6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2',
};

function Glyph({ name }) {
  return (
    <span className="glyph-well" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="glyph-svg" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d={icons[name] || icons.spark} />
      </svg>
    </span>
  );
}

export default Glyph;
