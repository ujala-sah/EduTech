function Settings() {
  return (
    <div>
      <div className="page-head">
        <h1>Settings</h1>
      </div>
      <section className="panel">
        <h2>Grading scale</h2>
        <p className="muted">This scale is defined in one backend file: server/utils/grading.js</p>
        <table>
          <thead>
            <tr>
              <th>Marks</th>
              <th>Grade</th>
              <th>Grade point</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>90–100</td>
              <td>A+</td>
              <td>4.0</td>
            </tr>
            <tr>
              <td>80–89</td>
              <td>A</td>
              <td>3.7</td>
            </tr>
            <tr>
              <td>70–79</td>
              <td>B+</td>
              <td>3.3</td>
            </tr>
            <tr>
              <td>60–69</td>
              <td>B</td>
              <td>3.0</td>
            </tr>
            <tr>
              <td>50–59</td>
              <td>C+</td>
              <td>2.7</td>
            </tr>
            <tr>
              <td>40–49</td>
              <td>C</td>
              <td>2.0</td>
            </tr>
            <tr>
              <td>Below 40</td>
              <td>F</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="panel">
        <h2>Portal notes</h2>
        <ul className="notice-list">
          <li>
            <strong>Student registration</strong>
            <p>Public registration always creates a student account. Teachers and admins are created here in Users.</p>
          </li>
          <li>
            <strong>File uploads</strong>
            <p>Allowed types: PDF, DOC, DOCX, ZIP, PPT, and images. Maximum size is 10MB.</p>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default Settings;
