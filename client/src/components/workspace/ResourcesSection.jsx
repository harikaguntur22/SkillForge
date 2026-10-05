import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Modal from '../common/Modal';
import {
  FolderGit2,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Palette,
  Code2,
  Wrench,
  Link2,
} from 'lucide-react';

const RESOURCE_META = {
  DOCUMENTATION: { label: 'Documentation', variant: 'brand', icon: FileText },
  CODE_REPOSITORY: { label: 'Repository', variant: 'purple', icon: FolderGit2 },
  DESIGN: { label: 'Design & Figma', variant: 'warning', icon: Palette },
  API: { label: 'API Reference', variant: 'sky', icon: Code2 },
  TOOL: { label: 'Development Tool', variant: 'success', icon: Wrench },
  OTHER: { label: 'Resource Link', variant: 'outline', icon: Link2 },
};

export const ResourcesSection = ({
  resources = [],
  onAddResource,
  onDeleteResource,
  currentUserId,
  isCreator,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('DOCUMENTATION');
  const [description, setDescription] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    await onAddResource({
      title: title.trim(),
      url: url.trim(),
      type,
      description: description.trim(),
    });

    setTitle('');
    setUrl('');
    setType('DOCUMENTATION');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-sky-400" />
            Project Resources, Repositories & Docs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Central repository for design files, API docs, repos, and architecture diagrams.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Add Resource
        </Button>
      </div>

      {/* Resources Cards Grid */}
      {resources.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
          <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No resources shared yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Share GitHub repos, Figma links, Postman collections, and documentation for the team.
          </p>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="mt-4"
          >
            Add First Resource
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((item) => {
            const meta = RESOURCE_META[item.type] || RESOURCE_META.OTHER;
            const IconComponent = meta.icon;
            const addedBy = item.addedBy || {};
            const canDelete = isCreator || addedBy._id === currentUserId;

            return (
              <div
                key={item._id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge
                      variant={meta.variant}
                      className="flex items-center gap-1.5 text-[11px]"
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {meta.label}
                    </Badge>

                    {canDelete && (
                      <button
                        onClick={() => onDeleteResource(item._id)}
                        title="Delete resource"
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {item.title}
                  </h4>

                  {item.description && (
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    By {addedBy.name || 'Member'}
                  </span>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-brand-600/20 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors border border-slate-800 hover:border-brand-500/30"
                  >
                    Open Link
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Project Resource"
        subtitle="Share documentation, design files, or repository links"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Resource Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Figma Design Tokens & Component Library"
            required
          />

          <Input
            label="Resource URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/..."
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Resource Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            >
              <option value="DOCUMENTATION">Documentation</option>
              <option value="CODE_REPOSITORY">Code Repository</option>
              <option value="DESIGN">Design & Figma</option>
              <option value="API">API Reference</option>
              <option value="TOOL">Tooling</option>
              <option value="OTHER">Other Link</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does this resource contain? Why is it useful?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Add Resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ResourcesSection;
