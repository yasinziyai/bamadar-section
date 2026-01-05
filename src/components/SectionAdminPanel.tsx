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

export default function SectionAdminPanel() {
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

      toast.success("ترتیب سکشن‌ها با موفقیت بروزرسانی شد");
    } catch (error: any) {
      console.error("Error reordering sections:", error);
      toast.error(
        error.message ||
          "خطا در بروزرسانی ترتیب سکشن‌ها. لطفا دوباره تلاش کنید.",
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
        throw new Error("URL عکس در پاسخ یافت نشد");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "خطا در آپلود عکس. لطفا دوباره تلاش کنید.");
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
        editingSection ? "سکشن با موفقیت ویرایش شد" : "سکشن با موفقیت ایجاد شد",
      );
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.message || "خطا در ارسال درخواست. لطفا دوباره تلاش کنید.",
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
    if (!window.confirm("آیا از حذف این سکشن اطمینان دارید؟")) return;

    try {
      await deleteSectionMutation.mutateAsync(id);
      toast.success("سکشن با موفقیت حذف شد");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "خطا در حذف سکشن");
    }
  };

  const getSectionTypeLabel = (type: SectionType) => {
    const labels: Record<SectionType, string> = {
      IconGrid: "شبکه آیکون",
      HeroBanner: "بنر اصلی",
      Carousel: "کاروسل",
      SingleImage: "تصویر واحد",
      ServiceGrid: "شبکه سرویس",
    };
    return labels[type];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl" dir="rtl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
              پنل مدیریت سکشن‌ها
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              سکشن‌های صفحه را اینجا اضافه، ویرایش و جابه‌جا کنید
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" />
            افزودن سکشن جدید
          </Button>
        </div>

        <div className="mb-4 text-xs text-slate-500 flex items-center justify-between">
          <span>برای تغییر ترتیب سکشن‌ها، کارت‌ها را بگیرید و بکشید.</span>
          <span>تغییر جزئیات هر سکشن از دکمه ویرایش انجام می‌شود.</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 max-w-5xl mx-auto">
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
                className="hover:shadow-md transition-all duration-300 border-slate-200 rounded-2xl overflow-hidden group cursor-move bg-white"
                draggable
                onDragStart={() =>
                  section.id && setDraggingSectionId(section.id)
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => section.id && handleSectionDrop(section.id)}
              >
                {/* Preview Images Section */}
                {images.length > 0 ? (
                  <div className="relative h-40 md:h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {images.length === 1 ? (
                      <div className="h-full p-1">
                        <img
                          src={getImageUrl(images[0].image)}
                          alt={images[0].name}
                          className="w-full h-full object-contain rounded-md group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    ) : images.length === 2 ? (
                      <div className="grid grid-cols-2 h-full gap-1 p-1">
                        {images.map((item, idx) => (
                          <div
                            key={idx}
                            className="relative overflow-hidden rounded-md bg-slate-300"
                          >
                            <img
                              src={getImageUrl(item.image!) || item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 h-full gap-1 p-1">
                        {images.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="relative overflow-hidden rounded-md bg-slate-300"
                          >
                            <img
                              src={getImageUrl(item.image!) || item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                            {idx === 3 && remainingImages > 0 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
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
                  <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border-b border-slate-200">
                    <div className="text-center">
                      <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">بدون تصویر</p>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                        {section.title || "بدون عنوان"}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-medium"
                        >
                          {getSectionTypeLabel(section.type)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
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
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">
                          تعداد محتوا
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {contentItems.length}
                      </span>
                    </div>

                    {/* Content Preview List */}
                    {contentItems.length > 0 && (
                      <div className="space-y-1.5 max-h-32 min-h-32 overflow-y-auto">
                        {contentItems.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded-md bg-slate-100 hover:bg-slate-100 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                              {idx + 1}
                            </div>
                            <span className="text-xs text-slate-700 flex-1 truncate">
                              {item.name || "بدون نام"}
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
                          <p className="text-xs text-slate-500 text-center pt-1">
                            و {contentItems.length - 3} مورد دیگر...
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
                        className="flex-1 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        ویرایش
                      </Button>
                      {section.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(section.id!)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4"
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
          <Card className="text-center py-10 border-dashed border-slate-300 bg-white/70 max-w-md mx-auto mt-8">
            <CardContent>
              <p className="text-slate-600 text-base md:text-lg">
                هنوز سکشنی ایجاد نشده است
              </p>
              <p className="text-slate-400 text-sm mt-2">
                برای شروع، روی «افزودن سکشن جدید» کلیک کنید
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
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0"
          dir="rtl"
          onClose={() => {
            setIsDialogOpen(false);
            resetForm();
          }}
        >
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <DialogHeader className="text-right">
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {editingSection ? "ویرایش سکشن" : "ایجاد سکشن جدید"}
              </DialogTitle>
            </DialogHeader>
          </div>
          <form
            id="section-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {/* اطلاعات اصلی سکشن - فشرده */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-200">
              <div className="space-y-1.5">
                <Label
                  htmlFor="type"
                  className="text-xs font-medium text-slate-600"
                >
                  نوع سکشن *
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
                    <SelectValue placeholder="نوع سکشن" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IconGrid">شبکه آیکون</SelectItem>
                    <SelectItem value="HeroBanner">بنر اصلی</SelectItem>
                    <SelectItem value="Carousel">کاروسل</SelectItem>
                    <SelectItem value="SingleImage">تصویر واحد</SelectItem>
                    <SelectItem value="ServiceGrid">شبکه سرویس</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="position"
                  className="text-xs font-medium text-slate-600"
                >
                  موقعیت *
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
                  عنوان
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="عنوان (اختیاری)"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* بخش محتواها */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  محتواها ({formData.contentItems?.length || 0})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddContent}
                  className="h-8 text-xs border-slate-300 hover:bg-slate-50"
                >
                  <Plus className="h-3 w-3 ml-1" />
                  افزودن
                </Button>
              </div>

              <div className="space-y-3">
                {formData.contentItems?.map((content, index) => (
                  <Card
                    key={content.id ?? index}
                    className="p-3 border-slate-200 shadow-sm hover:shadow transition-all bg-white cursor-move group"
                    draggable
                    onDragStart={() => handleContentDragStart(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleContentDrop(index)}
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                      <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          value={content.name}
                          onChange={(e) =>
                            handleContentChange(index, "name", e.target.value)
                          }
                          placeholder="نام محتوا *"
                          required
                          className="h-8 text-sm border-0 bg-transparent p-0 font-medium focus-visible:ring-0"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveContent(index)}
                        className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 text-slate-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          تصویر
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
                            className="cursor-pointer h-8 text-xs"
                          />
                          {uploadImageMutation.isPending && (
                            <p className="text-xs text-blue-600 flex items-center gap-1">
                              <span className="animate-spin">⏳</span>
                              در حال آپلود...
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
                                placeholder="URL تصویر"
                                className="text-xs h-7"
                              />
                              <div className="rounded overflow-hidden border border-slate-200">
                                <img
                                  src={
                                    getImageUrl(content.image) || content.image
                                  }
                                  alt="Preview"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                  }}
                                  className="w-full h-24 object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          نوع اکشن *
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
                            <SelectValue placeholder="نوع اکشن" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Web">وب</SelectItem>
                            <SelectItem value="Internal">داخلی</SelectItem>
                            <SelectItem value="None">هیچ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          آدرس *
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
                          placeholder="آدرس"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          موقعیت
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
                          نام نشان
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
                          placeholder="نام نشان"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                          رنگ نشان
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
                      <div className="col-span-2 grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-slate-600">
                              تاریخ انتشار (شمسی)
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={() => {
                                const now = new Date();
                                handleContentChange(
                                  index,
                                  "publishedAt",
                                  now.toISOString(),
                                );
                              }}
                            >
                              الان
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
                              تاریخ عدم انتشار (شمسی)
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={() => {
                                const now = new Date();
                                handleContentChange(
                                  index,
                                  "unpublishedAt",
                                  now.toISOString(),
                                );
                              }}
                            >
                              الان
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
                <Card className="p-6 text-center border-2 border-dashed border-slate-300 bg-slate-50/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      هنوز محتوایی اضافه نشده است
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddContent}
                      className="h-8 text-xs border-slate-300 hover:bg-slate-100"
                    >
                      <Plus className="h-3 w-3 ml-1" />
                      افزودن محتوا
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </form>
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 flex justify-start gap-2 shadow-lg">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
              className="h-9 min-w-[90px] text-sm border-slate-300"
            >
              انصراف
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
              className="bg-slate-900 hover:bg-slate-800 text-white h-9 min-w-[110px] text-sm"
            >
              <Save className="h-3.5 w-3.5 ml-1" />
              {createSectionMutation.isPending ||
              updateSectionMutation.isPending ||
              createContentMutation.isPending ||
              updateContentMutation.isPending
                ? "در حال ذخیره..."
                : "ذخیره"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
