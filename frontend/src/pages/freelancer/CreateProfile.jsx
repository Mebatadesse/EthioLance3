
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CircleUserRound,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  BriefcaseBusiness,
  DollarSign,
  GraduationCap,
  X,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/api\/?$/, "").replace(/\/$/, "");
const PROFILE_ENDPOINT = `${API_BASE_URL}/api/profiles/freelancer/me`;

const getToken = () =>
  localStorage.getItem("ethioLanceToken") ||
  sessionStorage.getItem("ethioLanceToken");

const readResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

function CreateProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [storedUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("ethioLanceUser") ||
        sessionStorage.getItem("ethioLanceUser") ||
        localStorage.getItem("user") ||
        "{}"
      );
    } catch {
      return {};
    }
  });

  const [formData, setFormData] = useState({
    title: "",
    bio: "",
    location: "",
    skills: [],
    hourlyRate: "",
    experience: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Profile image upload
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read this image. Please try another one.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // Add skill
  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const alreadyExists = formData.skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setError("This skill has already been added.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setSkillInput("");
    setError("");
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const continueToDashboard = () => {
    navigate("/freelancer-dashboard", { replace: true });
  };

  // Save profile
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = getToken();
    if (!token) {
      setError("Please log in again before saving your profile.");
      return;
    }

    if (storedUser.role && storedUser.role !== "FREELANCER") {
      setError("This profile is only available to freelancer accounts.");
      return;
    }

    const payload = {
      headline: formData.title.trim(),
      bio: formData.bio.trim(),
      location: formData.location.trim(),
      hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : null,
      skills: formData.skills,
    };

    try {
      setIsSaving(true);
      let response = await fetch(PROFILE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data = await readResponse(response);

      // The profile may already exist if the user returned to this page.
      if (response.status === 409) {
        response = await fetch(PROFILE_ENDPOINT, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        data = await readResponse(response);
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your freelancer profile.");
      }

      localStorage.setItem("ethioLanceProfileSkipped", "false");

      setSuccess("Your profile has been saved successfully!");

      setTimeout(() => {
        continueToDashboard();
      }, 1000);
    } catch (saveError) {
      setError(saveError.message || "Unable to save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Skip profile creation
  const handleSkip = () => {
    localStorage.setItem("ethioLanceProfileSkipped", "true");
    navigate("/freelancer-dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#fffaf6] font-[Inter,sans-serif] text-[#252525]">

      {/* HEADER */}
      <header className="border-b border-[#dca44b]/20 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-[#77717a] transition hover:text-[#805000]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/ethiolance-emblem.png"
              alt="EthioLance logo"
              className="h-10 w-10 object-contain"
            />

            <img
              src="/ethiolance-wordmark.png"
              alt="EthioLance"
              className="h-8 max-w-[150px] object-contain"
            />
          </div>

          <button
            onClick={handleSkip}
            className="text-sm font-semibold text-[#805000] transition hover:text-[#d99516]"
          >
            Skip for now
          </button>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">

        {/* INTRODUCTION */}
        <div className="mb-10 text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f4ad28]/30 bg-[#ffe8a3]/30 px-4 py-2 text-sm font-semibold text-[#805000]">
            <Sparkles size={16} />
            Freelancer Profile
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#151515] sm:text-4xl">
            Build Your Professional Profile
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#77717a] sm:text-base">
            Introduce yourself to potential clients. Add your skills,
            experience, and professional details to help clients discover you.
          </p>

          <p className="mt-3 text-xs font-medium text-[#9a7a4a]">
            You can complete or update your profile at any time.
          </p>

        </div>

        {/* FORM LAYOUT */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-7 lg:grid-cols-3">

          {/* LEFT PROFILE CARD */}
          <div className="lg:col-span-1">

            <div className="overflow-hidden rounded-3xl border border-[#dca44b]/20 bg-white shadow-[0_12px_35px_rgba(70,43,15,0.08)]">

              <div className="h-28 bg-gradient-to-r from-[#151515] via-[#382a18] to-[#805000]" />

              <div className="-mt-14 px-6 pb-7 text-center">

                {/* PROFILE IMAGE */}
                <div className="relative mx-auto mb-5 h-28 w-28">

                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#fff5e5] shadow-lg">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <CircleUserRound
                        size={65}
                        strokeWidth={1.2}
                        className="text-[#c69a45]"
                      />
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#ffe8a3] to-[#f4ad28] text-[#151515] shadow-md transition hover:scale-105"
                    title="Upload profile picture"
                  >
                    <Camera size={17} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                </div>

                <h2 className="text-lg font-bold text-[#151515]">
                  {storedUser.name || "Your Name"}
                </h2>

                <p className="mt-1 break-all text-sm text-[#77717a]">
                  {storedUser.email || "Your email address"}
                </p>

                <div className="my-6 border-t border-[#dca44b]/20" />

                <div className="rounded-2xl bg-[#fffaf6] p-4 text-left">

                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#805000]">
                    <Sparkles size={17} />
                    Profile Tips
                  </div>

                  <ul className="space-y-3 text-xs leading-5 text-[#77717a]">
                    <li className="flex gap-2">
                      <Check size={15} className="mt-0.5 shrink-0 text-[#d99516]" />
                      Use a professional profile picture.
                    </li>

                    <li className="flex gap-2">
                      <Check size={15} className="mt-0.5 shrink-0 text-[#d99516]" />
                      Write a clear professional introduction.
                    </li>

                    <li className="flex gap-2">
                      <Check size={15} className="mt-0.5 shrink-0 text-[#d99516]" />
                      Add skills that describe your expertise.
                    </li>
                  </ul>

                </div>

                {profileImage && (
                  <button
                    type="button"
                    onClick={() => setProfileImage("")}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                    Remove picture
                  </button>
                )}

                <p className="mt-4 text-xs text-[#a39a90]">
                  PNG, JPG or WEBP · Maximum 2MB
                </p>

              </div>
            </div>
          </div>

          {/* RIGHT FORM CARD */}
          <div className="space-y-7 lg:col-span-2">

            <div className="rounded-3xl border border-[#dca44b]/20 bg-white p-6 shadow-[0_12px_35px_rgba(70,43,15,0.06)] sm:p-8">

              <div className="mb-7">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe8a3]/40 text-[#805000]">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#151515]">
                      Professional Information
                    </h2>
                    <p className="text-xs text-[#77717a]">
                      Tell clients what you do.
                    </p>
                  </div>
                </div>
              </div>

              {/* PROFESSIONAL TITLE */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-[#252525]">
                  Professional Title
                  <span className="ml-2 text-xs font-normal text-[#a39a90]">
                    (Optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Full Stack Developer, Graphic Designer..."
                  className="w-full rounded-xl border border-[#e8dfd2] bg-[#fffdfa] px-4 py-3 text-sm outline-none transition placeholder:text-[#b5aaa0] focus:border-[#d99516] focus:ring-2 focus:ring-[#f4ad28]/15"
                />
              </div>

              {/* BIO */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-[#252525]">
                  About Me
                  <span className="ml-2 text-xs font-normal text-[#a39a90]">
                    (Optional)
                  </span>
                </label>

                <textarea
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Introduce yourself, describe your expertise, and explain how you can help clients..."
                  className="w-full resize-none rounded-xl border border-[#e8dfd2] bg-[#fffdfa] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#b5aaa0] focus:border-[#d99516] focus:ring-2 focus:ring-[#f4ad28]/15"
                />

                <p className="mt-2 text-right text-xs text-[#a39a90]">
                  {formData.bio.length} characters
                </p>
              </div>

              {/* LOCATION */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-[#252525]">
                  Location
                  <span className="ml-2 text-xs font-normal text-[#a39a90]">
                    (Optional)
                  </span>
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c69a45]"
                  />

                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g. Addis Ababa, Ethiopia"
                    className="w-full rounded-xl border border-[#e8dfd2] bg-[#fffdfa] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#b5aaa0] focus:border-[#d99516] focus:ring-2 focus:ring-[#f4ad28]/15"
                  />
                </div>
              </div>

              {/* SKILLS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#252525]">
                  Skills
                  <span className="ml-2 text-xs font-normal text-[#a39a90]">
                    (Optional)
                  </span>
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="e.g. React, UI/UX Design, Python..."
                    className="min-w-0 flex-1 rounded-xl border border-[#e8dfd2] bg-[#fffdfa] px-4 py-3 text-sm outline-none transition placeholder:text-[#b5aaa0] focus:border-[#d99516] focus:ring-2 focus:ring-[#f4ad28]/15"
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#151515] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#805000]"
                  >
                    <Plus size={17} />
                    Add Skill
                  </button>
                </div>

                {formData.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border border-[#f4ad28]/30 bg-[#fff5df] px-3 py-2 text-xs font-semibold text-[#805000]"
                      >
                        {skill}

                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-[#805000] transition hover:text-red-600"
                          aria-label={`Remove ${skill}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-xs text-[#a39a90]">
                  Add skills that represent your professional abilities.
                </p>
              </div>

            </div>

            {/* EXPERIENCE AND RATE */}
            <div className="rounded-3xl border border-[#dca44b]/20 bg-white p-6 shadow-[0_12px_35px_rgba(70,43,15,0.06)] sm:p-8">

              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe8a3]/40 text-[#805000]">
                  <GraduationCap size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#151515]">
                    Experience & Rates
                  </h2>
                  <p className="text-xs text-[#77717a]">
                    Share your experience and preferred rate.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                {/* EXPERIENCE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#252525]">
                    Experience Level
                    <span className="ml-2 text-xs font-normal text-[#a39a90]">
                      (Optional)
                    </span>
                  </label>

                  <select
                    value={formData.experience}
                    onChange={(e) => updateField("experience", e.target.value)}
                    className="w-full rounded-xl border border-[#e8dfd2] bg-[#fffdfa] px-4 py-3 text-sm text-[#252525] outline-none transition focus:border-[#d99516] focus:ring-2 focus:ring-[#f4ad28]/15"
                  >
                    <option value="">Select experience level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                {/* HOURLY RATE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#252525]">
                    Hourly Rate
                    <span className="ml-2 text-xs font-normal text-[#a39a90]">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <DollarSign
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c69a45]"
                    />

                    <input
                      type="number"
                      min="0"
                      value={formData.hourlyRate}
                      onChange={(e) => updateField("hourlyRate", e.target.value)}
                      placeholder="Enter your rate"
                      className="w-full rounded-xl border border-[#e8dfd2] bg-[#fffdfa] py-3 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#b5aaa0] focus:border-[#d99516] focus:ring-2 focus:ring-[#f4ad28]/15"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#805000]">
                      ETB
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* ERROR / SUCCESS MESSAGES */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <Check size={18} />
                {success}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

              <button
                type="button"
                onClick={handleSkip}
                className="rounded-xl border border-[#dca44b]/30 bg-white px-6 py-3.5 text-sm font-semibold text-[#805000] transition hover:bg-[#fff5df]"
              >
                Skip and Complete Later
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#ffe8a3] via-[#f4ad28] to-[#d99516] px-8 py-3.5 text-sm font-bold text-[#151515] shadow-[0_8px_20px_rgba(217,149,22,0.22)] transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {isSaving ? "Saving..." : "Save Profile"}
                <ArrowRight size={18} />
              </button>

            </div>

          </div>
        </form>

      </main>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-[#dca44b]/20 bg-[#151515] px-5 py-6 text-center">
        <p className="text-xs text-[#c5b9a5]">
          © {new Date().getFullYear()} EthioLance. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default CreateProfile;
