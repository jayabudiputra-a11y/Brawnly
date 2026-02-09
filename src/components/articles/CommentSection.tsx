import React, { useEffect as _e, useState as _s, useRef as _r } from "react";
import { commentsApi as _api } from "@/lib/api";
import { useAuth as _uA } from "@/hooks/useAuth";
import { toast as _t } from "sonner";
import { ChevronLeft as _Cl, ChevronRight as _Cr, Clock as _Ck } from "lucide-react"; 
import { getOptimizedImage as _gOI } from "@/lib/utils";
import type { CommentWithUser as _CWU } from "@/types";
import FormattedDate from "@/components/features/FormattedDate";

const CommentSection: React.FC<{ articleId: string }> = ({ articleId }) => {
  const { isAuthenticated: _isA } = _uA();
  const [_c, _sc] = _s<_CWU[]>([]);
  const [_cn, _scn] = _s("");
  const [_rT, _srT] = _s<{ id: string; name: string } | null>(null);
  const [_l, _sl] = _s(true);
  const _fR = _r<HTMLFormElement>(null);
  const [_cP, _scP] = _s(1);
  const _cP_val = 10;

  const _lC = async () => {
    if (!articleId) return;
    const _d = await _api.getCommentsByArticle(articleId);
    _sc(_d);
    _sl(false);
  };

  _e(() => {
    _lC();
  }, [articleId]);

  const _hS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!_cn.trim()) return;

    try {
      await _api.addComment(articleId, _cn, _rT?.id || null);
      _scn("");
      _srT(null);
      _t.success(_rT ? "Reply sent successfully!" : "Comment sent successfully!");
      await _lC();
    } catch (_err: any) {
      _t.error(_err.message);
    }
  };

  const _rC = _c.filter(_i => !_i.parent_id);
  const _iL = _cP * _cP_val;
  const _iF = _iL - _cP_val;
  const _cRC = _rC.slice(_iF, _iL);
  const _tP = Math.ceil(_rC.length / _cP_val);

  const _gR = (_pId: string) => _c.filter(_i => _i.parent_id === _pId);

  if (_l) {
    return (
      <p className="text-center py-10 text-neutral-600 dark:text-neutral-400 font-medium">
        Loading discussion...
      </p>
    );
  }

  return (
    <section className="relative w-full">
      <div className="flex justify-between items-baseline mb-8 -mt-4 relative z-20"> 
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
          Discussion ({_c.length})
        </h2>
        {_tP > 1 && (
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Page {_cP} / {_tP}
          </span>
        )}
      </div>

      {_isA ? (
        <form ref={_fR} onSubmit={_hS} className="mb-10 scroll-mt-32">
          {_rT && (
            <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-3 mb-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
              <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">
                Replying to <span className="font-bold">@{_rT.name}</span>
              </p>
              <button
                type="button"
                onClick={() => _srT(null)}
                className="text-[10px] bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg shadow-sm text-red-600 dark:text-red-400 font-black tracking-wider hover:bg-red-50 transition-all"
              >
                CANCEL
              </button>
            </div>
          )}

          <textarea
            className="w-full border-2 p-4 rounded-2xl outline-none transition-all
                       bg-white dark:bg-neutral-900 
                       border-gray-100 dark:border-neutral-800 
                       text-gray-900 dark:text-neutral-100
                       focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 placeholder:text-neutral-400"
            placeholder={_rT ? `Reply to ${_rT.name}...` : "Share your thoughts..."}
            rows={3}
            value={_cn}
            onChange={(e) => _scn(e.target.value)}
          />

          <button
            type="submit"
            className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            {_rT ? "Send Reply" : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="p-8 bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl text-center mb-10 border border-dashed border-neutral-200 dark:border-neutral-800">
          <p className="mb-4 text-neutral-600 dark:text-neutral-400 font-bold uppercase text-[10px] tracking-[.2em]">
            Join the conversation
          </p>
          <a
            href="/signin"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[.2em] hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Sign in to Comment
          </a>
        </div>
      )}

      <div className="space-y-10">
        {_cRC.length > 0 ? (
          _cRC.map((_item) => (
            <div key={_item.id} className="group/comment">
              <article className="flex gap-4">
                <img
                  src={_item.user_avatar_url ? _gOI(_item.user_avatar_url, 100) : `https://ui-avatars.com/api/?name=${encodeURIComponent(_item.user_name)}&background=random`}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-neutral-50 dark:ring-neutral-900 shrink-0"
                  alt={_item.user_name}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                      {_item.user_name}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">
                      <_Ck className="w-2.5 h-2.5" />
                      <FormattedDate dateString={_item.created_at} formatString="MMM d, yyyy" />
                    </span>
                  </div>
                  <p className="text-[14px] md:text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {_item.content}
                  </p>
                  <button
                    onClick={() => {
                      _srT({ id: _item.id, name: _item.user_name });
                      _fR.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="mt-2 text-[9px] uppercase font-black text-emerald-600 dark:text-emerald-500 hover:underline tracking-widest"
                  >
                    Reply
                  </button>
                </div>
              </article>

              {_gR(_item.id).length > 0 && (
                <div className="ml-10 md:ml-14 mt-6 space-y-6 border-l-2 border-neutral-100 dark:border-neutral-900 pl-6">
                  {_gR(_item.id).map((_reply) => (
                    <div key={_reply.id} className="flex gap-3 items-start">
                      <img 
                         src={_reply.user_avatar_url ? _gOI(_reply.user_avatar_url, 60) : `https://ui-avatars.com/api/?name=${encodeURIComponent(_reply.user_name)}&background=random`}
                         className="w-7 h-7 rounded-lg object-cover shrink-0"
                         alt=""
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-[13px] dark:text-white">{_reply.user_name}</span>
                          <span className="text-[8px] font-bold text-neutral-400 uppercase">
                            <FormattedDate dateString={_reply.created_at} formatString="MMM d" />
                          </span>
                        </div>
                        <p className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {_reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-neutral-50/50 dark:bg-neutral-900/10 rounded-[2rem] border-2 border-dotted border-neutral-100 dark:border-neutral-800">
            <p className="text-neutral-400 uppercase text-[9px] font-black tracking-[.3em]">
              No discussions yet
            </p>
          </div>
        )}
      </div>

      {_tP > 1 && (
        <nav className="mt-16 flex justify-center items-center gap-4" aria-label="Pagination">
          <button
            disabled={_cP === 1}
            onClick={() => {
              _scP(_p => _p - 1);
              window.scrollTo({ top: _fR.current?.offsetTop ? _fR.current.offsetTop - 200 : 0, behavior: 'smooth' });
            }}
            className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 disabled:opacity-20 hover:bg-emerald-600 hover:text-white transition-all text-neutral-600 dark:text-neutral-400"
          >
            <_Cl size={18} />
          </button>
          <span className="text-[9px] font-black uppercase tracking-[.2em] text-neutral-500">
            {_cP} / {_tP}
          </span>
          <button
            disabled={_cP === _tP}
            onClick={() => {
              _scP(_p => _p + 1);
              window.scrollTo({ top: _fR.current?.offsetTop ? _fR.current.offsetTop - 200 : 0, behavior: 'smooth' });
            }}
            className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 disabled:opacity-20 hover:bg-emerald-600 hover:text-white transition-all text-neutral-600 dark:text-neutral-400"
          >
            <_Cr size={18} />
          </button>
        </nav>
      )}
    </section>
  );
};

export default CommentSection;