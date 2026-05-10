import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';
import guideContent from '../../../claude-architect-study-guide.md?raw';
import './StudyView.css';

export default function StudyView() {
  return (
    <div className="study-view">
      <MarkdownRenderer content={guideContent} />
    </div>
  );
}
