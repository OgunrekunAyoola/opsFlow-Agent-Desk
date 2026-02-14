import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import api from '../../lib/api';
import { Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('medium');
  const [customerEmail, setCustomerEmail] = useState('demo@example.com');
  const [customerName, setCustomerName] = useState('John Doe');
  const [clientId, setClientId] = useState<string>('');
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await api.get('/clients');
        const list = (res.data?.clients || []).map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
        }));
        setClients(list);
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) loadClients();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/tickets', {
        subject,
        body,
        priority,
        customerEmail,
        customerName,
        clientId: clientId || undefined,
        channel: 'web_form',
        status: 'new',
        category: 'general',
      });
      setSubject('');
      setBody('');
      setPriority('medium');
      setClientId('');
      toast.success('Ticket created successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Subject</label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Unable to login"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Customer Name</label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Customer Email</label>
          <input
            type="email"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Client (optional)
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Priority</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
          <textarea
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none resize-none"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the issue..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            <Plus size={16} className="mr-2" /> Create Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
