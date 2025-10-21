import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { hostSessionThunk, joinSessionThunk} from "../../../../../store/slices/sessionSlice";
import {
  Video,
  Users,
  Calendar,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Card from "../../../../ui/Card";
import Button from "../../../../ui/Button";
import Input from "../../../../ui/Input";
import { toast } from "react-toastify";
import api from "../../../../../utils/api";

const HostSessionPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const message =
    location.state?.message ||
    "You do not have permission to access this page or session.";

  const { loading, error } = useSelector((state) => state.session);

  const [formData, setFormData] = useState({
    topic: "",
    startTime: "",
    endTime: "",
  });
  const [sessionLink, setSessionLink] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const checkPermission = async (id) => {
    try {
      const res = await api.get(`/sessions/${id}/permission-check`);
      const allowed = res.data.allowed;

      if (typeof allowed !== "boolean") {
        console.error(
          "Invalid `allowed` type. Expected boolean but got:",
          typeof allowed,
          allowed
        );
        toast.error("Unexpected response from permission check.");
        navigate("/403");
        return false;
      }

      if (!allowed) {
        toast.error("You do not have permission to join this session.");
        navigate("/403");
        return false;
      }

      return true;
    } catch (err) {
      toast.error("Failed to check session permission.");
      navigate("/403");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      toast.error("Please enter a session topic");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error("Please select start and end times");
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    if (startTime < new Date()) {
      toast.error("Start time cannot be in the past");
      return;
    }

    try {
      const result = await dispatch(
        hostSessionThunk({
          topic: formData.topic,
          startTime: formData.startTime,
          endTime: formData.endTime,
        })
      ).unwrap();

      if (result && result.session) {
        const sessionId = result.session.sessionId || result.session.id;
        const allowed = await checkPermission(sessionId);
        if (!allowed) return;
        setSessionLink(result.session.link);
        setSessionId(sessionId);
        setShowModal(true);

        toast.success("Session created successfully!");
        if (result.session.chatError) {
          toast.error(result.session.chatError);
        }
        
        // Navigate directly to the video session
        navigate(`/session/${sessionId}`);
      }
    } catch (err) {
      console.error("Failed to host meeting:", err);
      toast.error(
        err?.message || "Failed to create session. Please try again."
      );
    }
  };

  const openSession = async () => {
    const hasPermission = await checkPermission(sessionId);
    if (hasPermission) {
      navigate(`/session/${sessionId}`);
      setShowModal(false);
    }
    else {
      toast.error("You do not have permission to join this session");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sessionLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/createSession")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Session Options
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Session
          </h1>
          <p className="text-gray-600">
            Set up your virtual learning session with attention tracking
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Session Topic *"
                value={formData.topic}
                onChange={(e) => handleInputChange("topic", e.target.value)}
                placeholder="e.g., Introduction to React Hooks"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Start Time *"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                required
              />
              <Input
                label="End Time *"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
              >
                Host Session
                {loading ? "Creating Session..." : "Create Session"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                name="submit"
                onClick={() => navigate("/createSession")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Session Link Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Session Created Successfully!
                </h3>
                <p className="text-gray-600">
                  Share this link with participants to join your session
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sessionLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  {/* <Button colorscheme="blue" onClick={openSession}>Join Now</Button> */}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={openSession}
                  fullWidth
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Session
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostSessionPage;
