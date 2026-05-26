import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Image as ImageIcon,
  Layers,
  Hash,
  GripVertical,
  ImagePlus,
  LayoutGrid,
  Move,
  PackageCheck,
  Palette,
} from "lucide-react";
import type {
  Section,
  ContentItem,
  SectionType,
  ActionAppType,
} from "@/lib/types";
import {
  useGetSections,
  useCreateSectionWithContent,
  useUpdateSection,
  useCreateContent,
  useUpdateContent,
  useDeleteSection,
} from "@/hooks/useSections";
import { useUploadImage } from "@/hooks/useUploadImage";
import { getImageUrl } from "@/lib/imageUrl";
import { formatJalaliForDisplay, ensureIsoDate } from "@/lib/dateUtils";
import { PersianDateInput } from "@/components/ui/persian-date-input";
import { useAppSettings } from "@/lib/appSettings";

const sectionTypeStyles: Record<SectionType, string> = {
  IconGrid: "border-sky-200 bg-sky-50 text-sky-700",
  HeroBanner: "border-indigo-200 bg-indigo-50 text-indigo-700",
  Carousel: "border-amber-200 bg-amber-50 text-amber-700",
  SingleImage: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ServiceGrid: "border-rose-200 bg-rose-50 text-rose-700",
};

const sectionCopy = {
  fa: {
    title: "مدیریت سکشن‌ها",
    description: "سکشن‌های صفحه را اضافه، ویرایش و جابه‌جا کنید.",
    addSection: "افزودن سکشن جدید",
    totalSections: "کل سکشن‌ها",
    totalContents: "کل محتواها",
    imageItems: "آیتم‌های تصویری",
    dragHint: "برای تغییر ترتیب سکشن‌ها، کارت‌ها را بگیرید و بکشید.",
    editHint: "تغییر جزئیات هر سکشن از دکمه ویرایش انجام می‌شود.",
    noImage: "بدون تصویر",
    untitled: "بدون عنوان",
    contentCount: "تعداد محتوا",
    unnamed: "بدون نام",
    moreItems: (count: number) => `و ${count} مورد دیگر...`,
    edit: "ویرایش",
    emptyTitle: "هنوز سکشنی ایجاد نشده است",
    emptyDescription: "برای شروع، روی «افزودن سکشن جدید» کلیک کنید",
    editSection: "ویرایش سکشن",
    createSection: "ایجاد سکشن جدید",
    dialogDescription: "اطلاعات سکشن و آیتم‌های داخل آن را تنظیم کنید.",
    sectionType: "نوع سکشن *",
    sectionTypePlaceholder: "نوع سکشن",
    position: "موقعیت *",
    positionPlain: "موقعیت",
    titleLabel: "عنوان",
    titlePlaceholder: "عنوان (اختیاری)",
    contents: "محتواها",
    add: "افزودن",
    contentNamePlaceholder: "نام محتوا *",
    image: "تصویر",
    uploading: "در حال آپلود...",
    imageUrl: "URL تصویر",
    actionType: "نوع اکشن *",
    actionTypePlaceholder: "نوع اکشن",
    address: "آدرس *",
    addressPlaceholder: "آدرس",
    badgeName: "نام نشان",
    badgeNamePlaceholder: "نام نشان",
    badgeColor: "رنگ نشان",
    publishedAt: "تاریخ انتشار (شمسی)",
    unpublishedAt: "تاریخ عدم انتشار (شمسی)",
    now: "الان",
    emptyContent: "هنوز محتوایی اضافه نشده است",
    addContent: "افزودن محتوا",
    cancel: "انصراف",
    save: "ذخیره",
    saving: "در حال ذخیره...",
    reorderSuccess: "ترتیب سکشن‌ها با موفقیت بروزرسانی شد",
    reorderError: "خطا در بروزرسانی ترتیب سکشن‌ها. لطفا دوباره تلاش کنید.",
    imageUrlMissing: "URL عکس در پاسخ یافت نشد",
    uploadError: "خطا در آپلود عکس. لطفا دوباره تلاش کنید.",
    submitSuccessEdit: "سکشن با موفقیت ویرایش شد",
    submitSuccessCreate: "سکشن با موفقیت ایجاد شد",
    submitError: "خطا در ارسال درخواست. لطفا دوباره تلاش کنید.",
    deleteConfirm: "آیا از حذف این سکشن اطمینان دارید؟",
    deleteSuccess: "سکشن با موفقیت حذف شد",
    deleteError: "خطا در حذف سکشن",
    actions: {
      Web: "وب",
      Internal: "داخلی",
      None: "هیچ",
    },
    types: {
      IconGrid: "شبکه آیکون",
      HeroBanner: "بنر اصلی",
      Carousel: "کاروسل",
      SingleImage: "تصویر واحد",
      ServiceGrid: "شبکه سرویس",
    },
  },
  en: {
    title: "Sections",
    description: "Add, edit, and reorder homepage sections.",
    addSection: "Add section",
    totalSections: "Total sections",
    totalContents: "Total content",
    imageItems: "Image items",
    dragHint: "Drag cards to change the section order.",
    editHint: "Use the edit button to change section details.",
    noImage: "No image",
    untitled: "Untitled",
    contentCount: "Content count",
    unnamed: "Unnamed",
    moreItems: (count: number) => `and ${count} more...`,
    edit: "Edit",
    emptyTitle: "No sections have been created",
    emptyDescription: "Start by clicking Add section",
    editSection: "Edit section",
    createSection: "Create section",
    dialogDescription: "Configure the section and its content items.",
    sectionType: "Section type *",
    sectionTypePlaceholder: "Section type",
    position: "Position *",
    positionPlain: "Position",
    titleLabel: "Title",
    titlePlaceholder: "Title (optional)",
    contents: "Content",
    add: "Add",
    contentNamePlaceholder: "Content name *",
    image: "Image",
    uploading: "Uploading...",
    imageUrl: "Image URL",
    actionType: "Action type *",
    actionTypePlaceholder: "Action type",
    address: "Address *",
    addressPlaceholder: "Address",
    badgeName: "Badge name",
    badgeNamePlaceholder: "Badge name",
    badgeColor: "Badge color",
    publishedAt: "Publish date (Jalali)",
    unpublishedAt: "Unpublish date (Jalali)",
    now: "Now",
    emptyContent: "No content has been added",
    addContent: "Add content",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    reorderSuccess: "Section order updated",
    reorderError: "Could not update section order. Please try again.",
    imageUrlMissing: "Image URL was not found in the response",
    uploadError: "Could not upload image. Please try again.",
    submitSuccessEdit: "Section updated",
    submitSuccessCreate: "Section created",
    submitError: "Could not submit request. Please try again.",
    deleteConfirm: "Are you sure you want to delete this section?",
    deleteSuccess: "Section deleted",
    deleteError: "Could not delete section",
    actions: {
      Web: "Web",
      Internal: "Internal",
      None: "None",
    },
    types: {
      IconGrid: "Icon grid",
      HeroBanner: "Hero banner",
      Carousel: "Carousel",
      SingleImage: "Single image",
      ServiceGrid: "Service grid",
    },
  },
} as const;

export default function SectionAdminPanel() {
  const { language } = useAppSettings();
  const copy = sectionCopy[language] ?? sectionCopy.fa;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [draggingSectionId, setDraggingSectionId] = useState<number | null>(
    null,
  );
  const [draggingContentIndex, setDraggingContentIndex] = useState<
    number | null
  >(null);
  const [formData, setFormData] = useState<Section>({
    type: "IconGrid",
    title: "",
    position: 0,
    contentItems: [],
  });

  // React Query hooks
  const { data: sectionsData } = useGetSections();
  const sections = sectionsData?.data || sectionsData || [];
  const sectionStats = {
    total: (sections as Section[]).length,
    contents: (sections as Section[]).reduce(
      (sum, section) => sum + (section.contentItems?.length || 0),
      0,
    ),
    images: (sections as Section[]).reduce(
      (sum, section) =>
        sum + (section.contentItems?.filter((item) => item.image).length || 0),
      0,
    ),
  };
  const createSectionMutation = useCreateSectionWithContent();
  const updateSectionMutation = useUpdateSection();
  const createContentMutation = useCreateContent();
  const updateContentMutation = useUpdateContent();
  const deleteSectionMutation = useDeleteSection();
  const uploadImageMutation = useUploadImage();

  const handleAddContent = () => {
    setFormData((prev) => ({
      ...prev,
      contentItems: [
        ...(prev.contentItems || []),
        {
          name: "",
          image: "",
          actionType: "None",
          address: "",
          // position را همیشه 1-based نگه می‌داریم تا با بک‌اند سازگار باشد
          position: (prev.contentItems?.length || 0) + 1,
          badgeName: "",
          badgeBgColor: "",
          publishedAt: null,
          unpublishedAt: null,
        },
      ],
    }));
  };

  const handleSectionDrop = async (targetSectionId: number) => {
    if (
      !sections ||
      draggingSectionId === null ||
      draggingSectionId === targetSectionId
    ) {
      setDraggingSectionId(null);
      return;
    }

    const currentSections = [...sections] as Section[];
    const fromIndex = currentSections.findIndex(
      (section) => section.id === draggingSectionId,
    );
    const toIndex = currentSections.findIndex(
      (section) => section.id === targetSectionId,
    );

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingSectionId(null);
      return;
    }

    const reordered = [...currentSections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    try {
      await Promise.all(
        reordered.map((section, index) => {
          if (!section.id) return Promise.resolve();
          return updateSectionMutation.mutateAsync({
            id: section.id,
            // position را 1-based می‌کنیم تا تکراری نشود
            payload: { position: index + 1 },
          });
        }),
      );

      toast.success(copy.reorderSuccess);
    } catch (error: any) {
      console.error("Error reordering sections:", error);
      toast.error(
        error.message || copy.reorderError,
      );
    } finally {
      setDraggingSectionId(null);
    }
  };

  const handleContentDragStart = (index: number) => {
    setDraggingContentIndex(index);
  };

  const handleContentDrop = (targetIndex: number) => {
    if (draggingContentIndex === null || draggingContentIndex === targetIndex) {
      setDraggingContentIndex(null);
      return;
    }

    setFormData((prev) => {
      const items = prev.contentItems ? [...prev.contentItems] : [];
      if (
        draggingContentIndex === null ||
        draggingContentIndex < 0 ||
        draggingContentIndex >= items.length
      ) {
        return prev;
      }

      const [moved] = items.splice(draggingContentIndex, 1);
      items.splice(targetIndex, 0, moved);

      // به‌روزرسانی position بر اساس ترتیب جدید
      // position را 1-based و بدون تکرار تنظیم می‌کنیم
      const updatedItems = items.map((item, idx) => ({
        ...item,
        position: idx + 1,
      }));

      return {
        ...prev,
        contentItems: updatedItems,
      };
    });

    setDraggingContentIndex(null);
  };

  const handleRemoveContent = (index: number) => {
    setFormData((prev) => {
      const filtered = prev.contentItems?.filter((_, i) => i !== index) || [];
      // تنظیم مجدد position ها بعد از حذف
      const updated = filtered.map((item, idx) => ({
        ...item,
        position: idx + 1,
      }));
      return {
        ...prev,
        contentItems: updated,
      };
    });
  };

  const handleContentChange = (
    index: number,
    field: keyof ContentItem,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      contentItems:
        prev.contentItems?.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ) || [],
    }));
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      const result = await uploadImageMutation.mutateAsync({
        file,
        fileName: file.name,
        app: "superapp",
      });

      // استفاده از فیلد object از ریسپانس
      const imageUrl = result.object;

      if (imageUrl) {
        handleContentChange(index, "image", imageUrl);
      } else {
        console.warn("Response:", result);
        throw new Error(copy.imageUrlMissing);
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || copy.uploadError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted:", formData);

    try {
      const sectionId = editingSection?.id;

      // اگر در حال ویرایش هستیم
      if (editingSection && sectionId) {
        // مرتب‌سازی contents بر اساس position فعلی و سپس تنظیم position های 1-based
        // این کار از مشکل position تکراری جلوگیری می‌کند
        const sortedContents = [...(formData.contentItems || [])].sort(
          (a, b) => (a.position || 0) - (b.position || 0),
        );

        // تنظیم position های 1-based و بدون تکرار
        const contentsWithCorrectPosition = sortedContents.map((item, idx) => {
          const content: any = {
            id: item.id,
            name: item.name,
            image: item.image || undefined,
            actionType: item.actionType,
            address: item.address,
            position: idx + 1, // همیشه 1-based و بدون تکرار
            badgeName: item.badgeName || undefined,
            badgeBgColor: item.badgeBgColor || undefined,
          };

          // تبدیل تاریخ‌ها به میلادی (ISO) قبل از ارسال به بک‌اند
          // فقط اگر تاریخ وارد شده باشد و معتبر باشد، آن را به string میلادی تبدیل می‌کنیم
          if (item.publishedAt != null) {
            const isoDate = ensureIsoDate(item.publishedAt);
            if (isoDate) {
              content.publishedAt = isoDate;
            }
            // اگر تاریخ نامعتبر باشد، فیلد را در payload نمی‌گذاریم (undefined)
          }
          if (item.unpublishedAt != null) {
            const isoDate = ensureIsoDate(item.unpublishedAt);
            if (isoDate) {
              content.unpublishedAt = isoDate;
            }
            // اگر تاریخ نامعتبر باشد، فیلد را در payload نمی‌گذاریم (undefined)
          }

          return content;
        });

        // آپدیت سکشن به همراه تمام contents در یک transaction
        // این کار از مشکل position تکراری جلوگیری می‌کند
        await updateSectionMutation.mutateAsync({
          id: sectionId,
          payload: {
            type: formData.type,
            title: formData.title || undefined,
            position: formData.position,
            contents: contentsWithCorrectPosition,
          },
        });
      } else {
        // ایجاد سکشن جدید - همیشه از createSectionWithContent استفاده می‌کنیم
        const newContents =
          formData.contentItems?.filter((item) => item.id === undefined) || [];

        // ایجاد سکشن با کانتنت‌ها (حتی اگر خالی باشد)
        await createSectionMutation.mutateAsync({
          type: formData.type,
          title: formData.title || undefined,
          position: formData.position,
          contents: newContents.map((item) => {
            const content: any = {
              name: item.name,
              image: item.image || undefined,
              actionType: item.actionType,
              address: item.address,
              position: item.position,
              badgeName: item.badgeName || undefined,
              badgeBgColor: item.badgeBgColor || undefined,
            };

            // تبدیل تاریخ‌ها به میلادی (ISO) قبل از ارسال به بک‌اند
            // فقط اگر تاریخ وارد شده باشد و معتبر باشد، آن را به string میلادی تبدیل می‌کنیم
            if (item.publishedAt != null) {
              const isoDate = ensureIsoDate(item.publishedAt);
              if (isoDate) {
                content.publishedAt = isoDate;
              }
              // اگر تاریخ نامعتبر باشد، فیلد را در payload نمی‌گذاریم (undefined)
            }
            if (item.unpublishedAt != null) {
              const isoDate = ensureIsoDate(item.unpublishedAt);
              if (isoDate) {
                content.unpublishedAt = isoDate;
              }
              // اگر تاریخ نامعتبر باشد، فیلد را در payload نمی‌گذاریم (undefined)
            }

            return content;
          }),
        });
      }

      setIsDialogOpen(false);
      resetForm();
      toast.success(
        editingSection ? copy.submitSuccessEdit : copy.submitSuccessCreate,
      );
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.message || copy.submitError,
      );
    }
  };

  const resetForm = () => {
    setFormData({
      type: "IconGrid",
      title: "",
      position: 0,
      contentItems: [],
    });
    setEditingSection(null);
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    // اطمینان از اینکه contentItems به درستی کپی می‌شوند
    // و تاریخ‌ها به string تبدیل می‌شوند (ممکن است از بک‌اند به صورت Date object بیایند)
    setFormData({
      ...section,
      contentItems:
        section.contentItems?.map((item) => {
          // تبدیل تاریخ‌ها به string و normalize کردن آن‌ها
          // تاریخ‌ها از بک‌اند به صورت string می‌آیند، اما باید مطمئن شویم که معتبر هستند
          let publishedAt: string | null = null;
          let unpublishedAt: string | null = null;

          if (item.publishedAt) {
            // اگر string است، مطمئن شویم که معتبر است و به ISO تبدیل کنیم
            const date = new Date(item.publishedAt);
            if (!isNaN(date.getTime())) {
              // تاریخ معتبر است، آن را به ISO string تبدیل می‌کنیم
              publishedAt = date.toISOString();
            } else {
              console.warn("Invalid publishedAt date:", item.publishedAt);
            }
          }

          if (item.unpublishedAt) {
            // اگر string است، مطمئن شویم که معتبر است و به ISO تبدیل کنیم
            const date = new Date(item.unpublishedAt);
            if (!isNaN(date.getTime())) {
              // تاریخ معتبر است، آن را به ISO string تبدیل می‌کنیم
              unpublishedAt = date.toISOString();
            } else {
              console.warn("Invalid unpublishedAt date:", item.unpublishedAt);
            }
          }

          return {
            ...item,
            image: item.image || "",
            publishedAt,
            unpublishedAt,
          };
        }) || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(copy.deleteConfirm)) return;

    try {
      await deleteSectionMutation.mutateAsync(id);
      toast.success(copy.deleteSuccess);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || copy.deleteError);
    }
  };

  const getSectionTypeLabel = (type: SectionType) => {
    return copy.types[type];
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123c69] shadow-sm shadow-sky-900/15">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950">
                {copy.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {copy.description}
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="whitespace-nowrap bg-[#123c69] px-5 font-semibold text-white shadow-sm shadow-sky-900/20 hover:bg-[#0d3158]"
          >
            <Plus className="h-4 w-4" />
            {copy.addSection}
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  {copy.totalSections}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">
                  {sectionStats.total}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <LayoutGrid className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  {copy.totalContents}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">
                  {sectionStats.contents}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <PackageCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-amber-700">
                  {copy.imageItems}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">
                  {sectionStats.images}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <ImagePlus className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <Move className="h-4 w-4 text-sky-700" />
            {copy.dragHint}
          </span>
          <span>{copy.editHint}</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section: Section) => {
            const contentItems = section.contentItems || [];
            const images = contentItems
              .filter((item) => item.image)
              .slice(0, 4); // فقط 4 تصویر اول را نمایش می‌دهیم
            const remainingImages =
              contentItems.filter((item) => item.image).length - 4;

            return (
              <Card
                key={section.id}
                className="group cursor-move overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/70"
                draggable
                onDragStart={() =>
                  section.id && setDraggingSectionId(section.id)
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => section.id && handleSectionDrop(section.id)}
              >
                {/* Preview Images Section */}
                {images.length > 0 ? (
                  <div className="relative h-40 overflow-hidden bg-[#eef4f8] md:h-48">
                    {images.length === 1 ? (
                      <div className="h-full p-2">
                        <img
                          src={getImageUrl(images[0].image)}
                          alt={images[0].name}
                          className="h-full w-full rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    ) : images.length === 2 ? (
                      <div className="grid h-full grid-cols-2 gap-1.5 p-1.5">
                        {images.map((item, idx) => (
                          <div
                            key={idx}
                            className="relative overflow-hidden rounded-lg bg-slate-200"
                          >
                            <img
                              src={getImageUrl(item.image!) || item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid h-full grid-cols-2 gap-1.5 p-1.5">
                        {images.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="relative overflow-hidden rounded-lg bg-slate-200"
                          >
                            <img
                              src={getImageUrl(item.image!) || item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                            {idx === 3 && remainingImages > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65">
                                <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold text-white backdrop-blur-sm">
                                  +{remainingImages}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center border-b border-slate-200 bg-[#eef4f8]">
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium text-slate-400">
                        {copy.noImage}
                      </p>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="mb-2 line-clamp-2 text-base font-bold text-slate-950">
                        {section.title || copy.untitled}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={`text-xs font-semibold ${sectionTypeStyles[section.type]}`}
                        >
                          {getSectionTypeLabel(section.type)}
                        </Badge>
                        <div className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                          <Hash className="h-3 w-3" />
                          <span>{section.position}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Content Stats */}
                    <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/70 p-3">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-emerald-700" />
                        <span className="text-sm font-semibold text-emerald-800">
                          {copy.contentCount}
                        </span>
                      </div>
                      <span className="rounded-md bg-white px-2 py-0.5 text-sm font-extrabold text-slate-950 ring-1 ring-emerald-100">
                        {contentItems.length}
                      </span>
                    </div>

                    {/* Content Preview List */}
                    {contentItems.length > 0 && (
                      <div className="max-h-32 min-h-32 space-y-1.5 overflow-y-auto">
                        {contentItems.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-100 transition-colors hover:bg-sky-50"
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-bold text-sky-700 ring-1 ring-sky-100">
                              {idx + 1}
                            </div>
                            <span className="flex-1 truncate text-xs font-medium text-slate-700">
                              {item.name || copy.unnamed}
                            </span>
                            {item.badgeName && (
                              <Badge
                                className="text-xs px-1.5 py-0"
                                style={{
                                  backgroundColor:
                                    item.badgeBgColor || "#e2e8f0",
                                }}
                              >
                                {item.badgeName}
                              </Badge>
                            )}
                          </div>
                        ))}
                        {contentItems.length > 3 && (
                          <p className="pt-1 text-center text-xs text-slate-500">
                            {copy.moreItems(contentItems.length - 3)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 border-t border-slate-200 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
                        className="flex-1 border-indigo-200 bg-indigo-50 font-semibold text-indigo-700 shadow-none hover:bg-indigo-100"
                      >
                        <Edit className="h-4 w-4" />
                        {copy.edit}
                      </Button>
                      {section.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(section.id!)}
                          className="border-rose-200 bg-rose-50 px-4 text-rose-700 shadow-none hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sections.length === 0 && (
          <Card className="mx-auto mt-8 max-w-md border-dashed border-sky-200 bg-white/80 py-10 text-center shadow-sm">
            <CardContent>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <p className="text-base font-bold text-slate-700 md:text-lg">
                {copy.emptyTitle}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {copy.emptyDescription}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent
          className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0"
          onClose={() => {
            setIsDialogOpen(false);
            resetForm();
          }}
        >
          <div className="border-b border-slate-200 bg-[#eef4f8] p-4">
            <DialogHeader className="text-start">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-start text-lg font-bold text-slate-950">
                    {editingSection ? copy.editSection : copy.createSection}
                  </DialogTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    {copy.dialogDescription}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>
          <form
            id="section-form"
            onSubmit={handleSubmit}
            className="flex-1 space-y-4 overflow-y-auto bg-[#f8fafc] p-4"
          >
            {/* اطلاعات اصلی سکشن - فشرده */}
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="type"
                  className="text-xs font-medium text-slate-600"
                >
                  {copy.sectionType}
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: value as SectionType,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={copy.sectionTypePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IconGrid">{copy.types.IconGrid}</SelectItem>
                    <SelectItem value="HeroBanner">{copy.types.HeroBanner}</SelectItem>
                    <SelectItem value="Carousel">{copy.types.Carousel}</SelectItem>
                    <SelectItem value="SingleImage">{copy.types.SingleImage}</SelectItem>
                    <SelectItem value="ServiceGrid">{copy.types.ServiceGrid}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="position"
                  className="text-xs font-medium text-slate-600"
                >
                  {copy.position}
                </Label>
                <Input
                  id="position"
                  type="number"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: parseInt(e.target.value) || 0,
                    }))
                  }
                  required
                  min="0"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="title"
                  className="text-xs font-medium text-slate-600"
                >
                  {copy.titleLabel}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={copy.titlePlaceholder}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* بخش محتواها */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">
                  {copy.contents} ({formData.contentItems?.length || 0})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddContent}
                  className="h-8 border-sky-200 bg-sky-50 text-xs font-semibold text-sky-700 shadow-none hover:bg-sky-100"
                >
                  <Plus className="h-3 w-3" />
                  {copy.add}
                </Button>
              </div>

              <div className="space-y-3">
                {formData.contentItems?.map((content, index) => (
                  <Card
                    key={content.id ?? index}
                    className="group cursor-move rounded-xl border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-sky-200 hover:shadow-md"
                    draggable
                    onDragStart={() => handleContentDragStart(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleContentDrop(index)}
                  >
                    <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <GripVertical className="h-4 w-4 cursor-move text-slate-400" />
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Input
                          value={content.name}
                          onChange={(e) =>
                            handleContentChange(index, "name", e.target.value)
                          }
                          placeholder={copy.contentNamePlaceholder}
                          required
                          className="h-8 border-0 bg-transparent p-0 text-sm font-bold focus-visible:ring-0"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveContent(index)}
                        className="h-7 w-7 p-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          {copy.image}
                        </Label>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(index, file);
                              }
                            }}
                            disabled={uploadImageMutation.isPending}
                            className="h-8 cursor-pointer border-slate-200 bg-slate-50 text-xs"
                          />
                          {uploadImageMutation.isPending && (
                            <p className="text-xs text-blue-600 flex items-center gap-1">
                              <span className="animate-spin">⏳</span>
                              {copy.uploading}
                            </p>
                          )}
                          {content.image && (
                            <div className="space-y-1.5">
                              <Input
                                value={content.image}
                                onChange={(e) =>
                                  handleContentChange(
                                    index,
                                    "image",
                                    e.target.value,
                                  )
                                }
                                placeholder={copy.imageUrl}
                                className="text-xs h-7"
                              />
                              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                <img
                                  src={
                                    getImageUrl(content.image) || content.image
                                  }
                                  alt="Preview"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                  }}
                                  className="h-24 w-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          {copy.actionType}
                        </Label>
                        <Select
                          value={content.actionType}
                          onValueChange={(value) =>
                            handleContentChange(
                              index,
                              "actionType",
                              value as ActionAppType,
                            )
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder={copy.actionTypePlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Web">{copy.actions.Web}</SelectItem>
                            <SelectItem value="Internal">{copy.actions.Internal}</SelectItem>
                            <SelectItem value="None">{copy.actions.None}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          {copy.address}
                        </Label>
                        <Input
                          value={content.address}
                          onChange={(e) =>
                            handleContentChange(
                              index,
                              "address",
                              e.target.value,
                            )
                          }
                          required
                          placeholder={copy.addressPlaceholder}
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          {copy.positionPlain}
                        </Label>
                        <Input
                          type="number"
                          value={content.position}
                          onChange={(e) =>
                            handleContentChange(
                              index,
                              "position",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          required
                          min="0"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          {copy.badgeName}
                        </Label>
                        <Input
                          value={content.badgeName}
                          onChange={(e) =>
                            handleContentChange(
                              index,
                              "badgeName",
                              e.target.value,
                            )
                          }
                          placeholder={copy.badgeNamePlaceholder}
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          {copy.badgeColor}
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={content.badgeBgColor || "#000000"}
                            onChange={(e) =>
                              handleContentChange(
                                index,
                                "badgeBgColor",
                                e.target.value,
                              )
                            }
                            className="w-12 h-8 cursor-pointer rounded border border-slate-300 p-1"
                          />
                          <Input
                            value={content.badgeBgColor || ""}
                            onChange={(e) =>
                              handleContentChange(
                                index,
                                "badgeBgColor",
                                e.target.value,
                              )
                            }
                            placeholder="#000000"
                            className="h-8 font-mono text-xs flex-1"
                          />
                        </div>
                      </div>

                      {/* تاریخ انتشار و عدم انتشار */}
                      <div className="grid gap-3 border-t border-slate-100 pt-2 md:col-span-2 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-slate-600">
                              {copy.publishedAt}
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-sky-700 hover:bg-sky-50"
                              onClick={() => {
                                const now = new Date();
                                handleContentChange(
                                  index,
                                  "publishedAt",
                                  now.toISOString(),
                                );
                              }}
                            >
                              {copy.now}
                            </Button>
                          </div>
                          <PersianDateInput
                            value={content.publishedAt ?? null}
                            onChange={(dateValue) => {
                              handleContentChange(
                                index,
                                "publishedAt",
                                dateValue,
                              );
                            }}
                            placeholder="1403/09/15 14:30"
                            className="h-8 text-sm"
                          />
                          {content.publishedAt && (
                            <p className="text-xs text-slate-500">
                              {formatJalaliForDisplay(content.publishedAt)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-slate-600">
                              {copy.unpublishedAt}
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-sky-700 hover:bg-sky-50"
                              onClick={() => {
                                const now = new Date();
                                handleContentChange(
                                  index,
                                  "unpublishedAt",
                                  now.toISOString(),
                                );
                              }}
                            >
                              {copy.now}
                            </Button>
                          </div>
                          <PersianDateInput
                            value={content.unpublishedAt ?? null}
                            onChange={(dateValue) => {
                              handleContentChange(
                                index,
                                "unpublishedAt",
                                dateValue,
                              );
                            }}
                            placeholder="1403/09/15 14:30"
                            className="h-8 text-sm"
                          />
                          {content.unpublishedAt && (
                            <p className="text-xs text-slate-500">
                              {formatJalaliForDisplay(content.unpublishedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {(!formData.contentItems ||
                formData.contentItems.length === 0) && (
                <Card className="border-2 border-dashed border-sky-200 bg-white/80 p-6 text-center shadow-sm">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                      <Plus className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {copy.emptyContent}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddContent}
                      className="h-8 border-sky-200 bg-sky-50 text-xs font-semibold text-sky-700 shadow-none hover:bg-sky-100"
                    >
                      <Plus className="h-3 w-3" />
                      {copy.addContent}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </form>
          <div className="sticky bottom-0 flex justify-start gap-2 border-t border-slate-200 bg-white p-3 shadow-lg">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
              className="h-9 min-w-[90px] border-slate-300 text-sm"
            >
              {copy.cancel}
            </Button>
            <Button
              type="submit"
              form="section-form"
              size="sm"
              disabled={
                createSectionMutation.isPending ||
                updateSectionMutation.isPending ||
                createContentMutation.isPending ||
                updateContentMutation.isPending
              }
              className="h-9 min-w-[110px] bg-[#123c69] text-sm font-semibold text-white hover:bg-[#0d3158]"
            >
              <Save className="h-3.5 w-3.5" />
              {createSectionMutation.isPending ||
              updateSectionMutation.isPending ||
              createContentMutation.isPending ||
              updateContentMutation.isPending
                ? copy.saving
                : copy.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
